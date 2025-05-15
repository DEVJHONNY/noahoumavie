const fs = require('fs');
const XLSX = require('xlsx');

const reservas = JSON.parse(fs.readFileSync('reservas.json', 'utf8'));
const ws = XLSX.utils.json_to_sheet(reservas);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Reservas');
XLSX.writeFile(wb, 'reservas.xlsx');
console.log('Arquivo reservas.xlsx gerado com sucesso!');
