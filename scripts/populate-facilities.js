const mongoose = require('mongoose');

// Configurar variável de ambiente
process.env.MONGODB_URI = 'mongodb+srv://marketingnity:57iJAMXtxHqw5KIw@nity.y7svlua.mongodb.net/?retryWrites=true&w=majority&appName=Nity';

// Definir o schema do Facility
const FacilitySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true
  },
  icon: { 
    type: String, 
    required: false 
  }
}, {
  timestamps: true
});

const Facility = mongoose.model('Facility', FacilitySchema);

const facilities = [
  { name: 'Próximo a estação de metro', icon: '/assets/facilities/svg/metro.svg' },
  { name: 'Boa localização', icon: '/assets/facilities/svg/location.svg' },
  { name: 'X quadras', icon: '/assets/facilities/svg/x_quadras.svg' },
  { name: 'Quadras poliesportivas', icon: '/assets/facilities/svg/quadras_poli.svg' },
  { name: 'Piscina', icon: '/assets/facilities/svg/piscina.svg' },
  { name: 'Tênis', icon: '/assets/facilities/svg/tenis.svg' },
  { name: 'Beach tênis', icon: '/assets/facilities/svg/beach_tenis.svg' },
  { name: 'Ginásio', icon: '/assets/facilities/svg/ginasio.svg' },
  { name: 'Quadras cobertas', icon: '/assets/facilities/svg/quadras_cobertas.svg' },
  { name: 'Salão de jogos', icon: '/assets/facilities/svg/salao_jogos.svg' },
  { name: 'Academia', icon: '/assets/facilities/svg/academia.svg' },
  { name: 'Aula de dança', icon: '/assets/facilities/svg/aula_danca.svg' }
];

async function populateFacilities() {
  try {
    console.log('Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado ao MongoDB!');
    
    console.log('Iniciando população de facilities...');
    
    // Verificar se já existem facilities
    const existingFacilities = await Facility.countDocuments();
    
    if (existingFacilities > 0) {
      console.log(`Já existem ${existingFacilities} facilities no banco. Removendo para repopular...`);
      await Facility.deleteMany({});
    }
    
    // Inserir facilities iniciais
    console.log('Inserindo facilities...');
    const createdFacilities = await Facility.insertMany(facilities);
    
    console.log(`${createdFacilities.length} facilities criados com sucesso!`);
    
    // Listar facilities criados
    console.log('\nFacilities criados:');
    createdFacilities.forEach((facility, index) => {
      console.log(`${index + 1}. ${facility.name} - ${facility.icon}`);
    });
    
  } catch (error) {
    console.error('Erro ao popular facilities:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDesconectado do MongoDB.');
    process.exit(0);
  }
}

populateFacilities();