const HOST = process.env?.HOST ?? 'localhost';
const PORT = Number(process.env?.PORT ?? '4000');

console.log(`HOST: ${HOST}`);
console.log(`PORT: ${PORT}`);
