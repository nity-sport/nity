// scripts/seed-sports.ts
// Configurar variável de ambiente
process.env.MONGODB_URI = 'mongodb+srv://marketingnity:57iJAMXtxHqw5KIw@nity.y7svlua.mongodb.net/?retryWrites=true&w=majority&appName=Nity';

import dbConnect from '../src/lib/dbConnect';
import Sport from '../src/models/Sport';

const initialSports = [
  { name: 'Futebol', icon: '/assets/sports/svg/ball.svg' },
  { name: 'Volei', icon: '/assets/sports/svg/volley.svg' },
  { name: 'Vôlei', icon: '/assets/sports/svg/sports_volleyball.svg' },
  { name: 'Basquete', icon: '/assets/sports/svg/sports_basketball.svg' },
  { name: 'Basquetebol', icon: '/assets/sports/svg/sports_basketball (1).svg' },
  { name: 'Tenis', icon: '/assets/sports/svg/tennis.svg' },
  { name: 'Tênis', icon: '/assets/sports/svg/tennis.svg' },
  { name: 'Natação', icon: '/assets/sports/svg/swimming.svg' },
  { name: 'Swimming', icon: '/assets/sports/svg/swimming.svg' },
  { name: 'Ciclismo', icon: '/assets/sports/svg/bike.svg' },
  { name: 'Bicicleta', icon: '/assets/sports/svg/bike.svg' },
  { name: 'Canoagem', icon: '/assets/sports/svg/kayaking.svg' },
  { name: 'Kayaking', icon: '/assets/sports/svg/kayaking.svg' },
  { name: 'Artes Marciais', icon: '/assets/sports/svg/sports_martial_arts.svg' },
  { name: 'Judô', icon: '/assets/sports/svg/sports_martial_arts.svg' },
  { name: 'Karatê', icon: '/assets/sports/svg/sports_martial_arts.svg' },
  { name: 'Muay Thai', icon: '/assets/sports/svg/sports_martial_arts.svg' },
  { name: 'Boxe', icon: '/assets/sports/svg/sports_martial_arts.svg' },
  { name: 'Taekwondo', icon: '/assets/sports/svg/sports_martial_arts.svg' },
  // Esportes sem ícone específico - usando ícone genérico
  { name: 'Handball', icon: '/assets/sports/svg/ball.svg' },
  { name: 'Surf', icon: '/assets/sports/svg/ball.svg' },
  { name: 'Atletismo', icon: '/assets/sports/svg/ball.svg' },
  { name: 'Ginástica', icon: '/assets/sports/svg/ball.svg' },
  { name: 'Skate', icon: '/assets/sports/svg/ball.svg' },
  { name: 'Corrida', icon: '/assets/sports/svg/ball.svg' },
  { name: 'Escalada', icon: '/assets/sports/svg/ball.svg' },
  { name: 'Yoga', icon: '/assets/sports/svg/ball.svg' },
  { name: 'Pilates', icon: '/assets/sports/svg/ball.svg' },
  { name: 'Rugby', icon: '/assets/sports/svg/ball.svg' },
  { name: 'Futsal', icon: '/assets/sports/svg/ball.svg' },
  { name: 'Beach Soccer', icon: '/assets/sports/svg/ball.svg' },
  { name: 'Polo Aquático', icon: '/assets/sports/svg/swimming.svg' },
  { name: 'Triathlon', icon: '/assets/sports/svg/bike.svg' }
];

async function seedSports() {
  try {
    await dbConnect();
    
    console.log('Iniciando seeding de esportes...');
    
    // Verificar se já existem esportes
    const existingSports = await Sport.countDocuments();
    
    if (existingSports > 0) {
      console.log(`Já existem ${existingSports} esportes no banco. Pulando seeding.`);
      return;
    }
    
    // Inserir esportes iniciais
    const createdSports = await Sport.insertMany(initialSports);
    
    console.log(`${createdSports.length} esportes criados com sucesso!`);
    
    // Listar esportes criados
    createdSports.forEach(sport => {
      console.log(`- ${sport.name}`);
    });
    
  } catch (error) {
    console.error('Erro ao fazer seeding dos esportes:', error);
  } finally {
    process.exit(0);
  }
}

seedSports();