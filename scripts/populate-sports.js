// scripts/populate-sports.js
const mongoose = require('mongoose');

// Configurar variável de ambiente
process.env.MONGODB_URI = 'mongodb+srv://marketingnity:57iJAMXtxHqw5KIw@nity.y7svlua.mongodb.net/?retryWrites=true&w=majority&appName=Nity';

// Definir o schema do Sport
const SportSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  icon: { 
    type: String, 
    required: false 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  status: {
    type: String,
    enum: ['aceito', 'sugerido'],
    default: 'aceito'
  }
}, {
  timestamps: true
});

const Sport = mongoose.model('Sport', SportSchema);

const initialSports = [
  { name: 'Futebol', icon: '/assets/sports/svg/ball.svg', status: 'aceito' },
  { name: 'Volei', icon: '/assets/sports/svg/volley.svg', status: 'aceito' },
  { name: 'Basquete', icon: '/assets/sports/svg/sports_basketball.svg', status: 'aceito' },
  { name: 'Tenis', icon: '/assets/sports/svg/tennis.svg', status: 'aceito' },
  { name: 'Surf', icon: '/assets/sports/svg/ball.svg', status: 'aceito' },
  { name: 'Handball', icon: '/assets/sports/svg/ball.svg', status: 'aceito' },
  { name: 'Muay Thai', icon: '/assets/sports/svg/sports_martial_arts.svg', status: 'aceito' },
  { name: 'Swimming', icon: '/assets/sports/svg/swimming.svg', status: 'aceito' }
];

async function populateSports() {
  try {
    console.log('Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado ao MongoDB!');
    
    console.log('Iniciando população de esportes...');
    
    // Verificar se já existem esportes
    const existingSports = await Sport.countDocuments();
    
    if (existingSports > 0) {
      console.log(`Já existem ${existingSports} esportes no banco. Removendo para repopular...`);
      await Sport.deleteMany({});
    }
    
    // Inserir esportes iniciais
    console.log('Inserindo esportes...');
    const createdSports = await Sport.insertMany(initialSports);
    
    console.log(`${createdSports.length} esportes criados com sucesso!`);
    
    // Listar esportes criados
    console.log('\nEsportes criados:');
    createdSports.forEach((sport, index) => {
      console.log(`${index + 1}. ${sport.name} - ${sport.icon}`);
    });
    
  } catch (error) {
    console.error('Erro ao popular esportes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDesconectado do MongoDB.');
    process.exit(0);
  }
}

populateSports();