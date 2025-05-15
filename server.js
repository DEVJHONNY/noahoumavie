const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'reservas.json');
const RECADOS_FILE = path.join(__dirname, 'recados.json');
const PRESENCAS_FILE = path.join(__dirname, 'presencas.json');

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Função robusta para ler dados
function readData() {
    try {
        if (!fs.existsSync(DATA_FILE)) return [];
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (e) {
        return [];
    }
}

// Função robusta para escrever dados
function writeData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
        // log opcional
    }
}

// Funções para recados
function readRecados() {
    try {
        if (!fs.existsSync(RECADOS_FILE)) return [];
        return JSON.parse(fs.readFileSync(RECADOS_FILE, 'utf8'));
    } catch (e) {
        return [];
    }
}
function writeRecados(data) {
    try {
        fs.writeFileSync(RECADOS_FILE, JSON.stringify(data, null, 2));
    } catch (e) { }
}

// Funções para presenças
function readPresencas() {
    try {
        if (!fs.existsSync(PRESENCAS_FILE)) return [];
        return JSON.parse(fs.readFileSync(PRESENCAS_FILE, 'utf8'));
    } catch (e) {
        return [];
    }
}
function writePresencas(data) {
    try {
        fs.writeFileSync(PRESENCAS_FILE, JSON.stringify(data, null, 2));
    } catch (e) { }
}

app.get('/api/reservas', (req, res) => {
    res.json(readData());
});

app.post('/api/reservar', (req, res) => {
    let { nome, tipo } = req.body;
    if (!nome || !tipo) return res.status(400).json({ error: 'Dados inválidos' });
    nome = nome.trim();
    if (!nome) return res.status(400).json({ error: 'Nome obrigatório' });
    let data = readData();
    // Limite de 40 por tipo
    const count = data.filter(r => r.tipo === tipo).length;
    if (count >= 40) return res.status(400).json({ error: 'Limite atingido para esta fralda' });
    // Impede reserva duplicada por nome/tipo
    if (data.some(r => r.nome.trim().toLowerCase() === nome.toLowerCase() && r.tipo === tipo)) {
        return res.status(400).json({ error: 'Você já reservou este tipo de fralda.' });
    }
    data.push({ nome, tipo });
    writeData(data);
    res.json({ ok: true });
});

app.delete('/api/cancelar', (req, res) => {
    let { nome, tipo } = req.body;
    if (!nome || !tipo) return res.status(400).json({ error: 'Dados inválidos' });
    nome = nome.trim();
    let data = readData();
    const inicial = data.length;
    data = data.filter(r => !(r.nome.trim().toLowerCase() === nome.toLowerCase() && r.tipo === tipo));
    if (data.length === inicial) {
        return res.status(404).json({ error: 'Reserva não encontrada.' });
    }
    writeData(data);
    res.json({ ok: true });
});

// Rotas de recados
app.get('/api/recados', (req, res) => {
    res.json(readRecados());
});
app.post('/api/recados', (req, res) => {
    let { autor, texto } = req.body;
    if (!autor || !texto) return res.status(400).json({ error: 'Dados inválidos' });
    autor = autor.trim();
    texto = texto.trim();
    if (!autor || !texto) return res.status(400).json({ error: 'Preencha nome e recado' });
    let recados = readRecados();
    recados.push({ autor, texto, data: new Date().toISOString() });
    writeRecados(recados);
    res.json({ ok: true });
});

// Rotas de presenças
app.get('/api/presencas', (req, res) => {
    res.json(readPresencas());
});
app.post('/api/presencas', (req, res) => {
    let { nome, email, adultos, maiores, pequenas } = req.body;
    if (!nome || !email) return res.status(400).json({ error: 'Dados inválidos' });
    nome = nome.trim();
    email = email.trim();
    if (!nome || !email) return res.status(400).json({ error: 'Preencha nome e e-mail' });
    let presencas = readPresencas();
    presencas.push({
        nome, email,
        adultos: adultos || 0,
        maiores: maiores || 0,
        pequenas: pequenas || 0,
        data: new Date().toISOString()
    });
    writePresencas(presencas);
    res.json({ ok: true });
});

app.get('/index', (req, res) => {
    res.redirect('/index.html');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
