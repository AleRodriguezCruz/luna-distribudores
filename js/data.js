/* ---------- inventario Luna Distribuidores ---------- */
/* Edita este archivo para agregar, quitar o modificar productos.
   "img" apunta a assets/products/. "featured": true lo muestra en el carrusel. */

const PRODUCTS = [
  { id:1,  brand:"American Rag", name:"Jeans Comfort Stretch slim fit, lavado claro", cat:"pantalones", img:"assets/products/jeans-american-rag-claro.jpg", price:300, old:null, sizes:["30","32","34","36"], featured:true },
  { id:2,  brand:"MBX Premium Goods", name:"Camisa manga corta, estampado geométrico menta", cat:"camisas", img:"assets/products/camisa-mbx-geometrico-menta.jpg", price:650, old:790, sizes:["CH","M","G","XG"], featured:true },
  { id:3,  brand:"Dickies", name:"Pantalón Genuine Flex doble rodilla, loose fit", cat:"pantalones", img:"assets/products/pantalon-dickies-flex.jpg", price:300, old:null, sizes:["32","34","36"], featured:true },
  { id:4,  brand:"American Rag", name:"Jeans Comfort Stretch slim fit, lavado oscuro", cat:"pantalones", img:"assets/products/jeans-american-rag-oscuro.jpg", price:300, old:null, sizes:["30","32","34","36"], featured:false },
  { id:5,  brand:"Levi's", name:"Jeans 511 slim, sits below waist", cat:"pantalones", img:"assets/products/jeans-levis-511-slim.jpg", price:480, old:null, sizes:["30","32","34","36"], featured:true },
  { id:6,  brand:"O'Neill", name:"Playera cuello redondo con logo estampado", cat:"playeras", img:"assets/products/playera-oneill.jpg", price:350, old:null, sizes:["CH","M","G","XG"], featured:true },
  { id:7,  brand:"Eddie Bauer", name:"Pantalón utility Flex, negro", cat:"pantalones", img:"assets/products/pantalon-eddie-bauer.jpg", price:300, old:null, sizes:["32","34","36"], featured:false },
  { id:8,  brand:"English Laundry", name:"Jeans Harrow straight fit, lavado claro", cat:"pantalones", img:"assets/products/jeans-english-laundry-claro.jpg", price:350, old:null, sizes:["32","34","36"], featured:true },
  { id:9,  brand:"English Laundry", name:"Jeans Harrow straight fit, lavado oscuro", cat:"pantalones", img:"assets/products/jeans-english-laundry-oscuro.jpg", price:350, old:null, sizes:["32","34","36"], featured:false },
  { id:10, brand:"American Rag", name:"Jeans slim fit, lavado medio", cat:"pantalones", img:"assets/products/jeans-american-rag-medio.jpg", price:300, old:null, sizes:["30","32","34"], featured:false },
  { id:11, brand:"MBX Premium Goods", name:"Camisa manga corta, estampado limones", cat:"camisas", img:"assets/products/camisa-mbx-limones.jpg", price:650, old:null, sizes:["CH","M","G","XG"], featured:false },
  { id:12, brand:"Weatherproof Vintage", name:"Tech Pant straight fit, negro", cat:"pantalones", img:"assets/products/pantalon-weatherproof-negro.jpg", price:250, old:null, sizes:["30","32","34","36"], featured:false },
  { id:13, brand:"Weatherproof Vintage", name:"Tech Pant straight fit, azul marino", cat:"pantalones", img:"assets/products/pantalon-weatherproof-marino.jpg", price:250, old:null, sizes:["30","32","34","36"], featured:true },
  { id:14, brand:"Calvin Klein Jeans", name:"Jeans 400 Qtr, lavado claro", cat:"pantalones", img:"assets/products/jeans-calvin-klein.jpg", price:450, old:null, sizes:["30","32","34"], featured:true },
  { id:15, brand:"MBX Premium Goods", name:"Camisa manga corta, estampado triángulos", cat:"camisas", img:"assets/products/camisa-mbx-triangulos.jpg", price:250, old:320, sizes:["CH","M","G","XG"], featured:false },
];

const CATS = [
  { id:"playeras",   label:"Playeras" },
  { id:"camisas",    label:"Camisas" },
  { id:"pantalones", label:"Pantalones y jeans" },
];

/* Marcas que sí tenemos fotografiadas en inventario (alimentan los filtros) */
const BRANDS = [...new Set(PRODUCTS.map(p => p.brand))].sort();

const SIZES = [...new Set(PRODUCTS.flatMap(p => p.sizes))]
  .sort((a,b)=> (isNaN(a)||isNaN(b)) ? a.localeCompare(b) : a-b);
