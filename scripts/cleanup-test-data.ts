import { PrismaClient } from '@prisma/client';
import readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function cleanup() {
  console.log('🚨 WARNING: This will delete ALL test data!');
  console.log('This includes:');
  console.log('- All orders');
  console.log('- All customers');
  console.log('- All order items');
  console.log('\nThis will NOT delete:');
  console.log('- Admin users');
  console.log('- Products');
  console.log('- Categories');
  
  rl.question('\nType "DELETE" to confirm: ', async (answer) => {
    if (answer === 'DELETE') {
      try {
        console.log('\n🗑️  Deleting order items...');
        await prisma.orderItem.deleteMany();
        
        console.log('🗑️  Deleting orders...');
        await prisma.order.deleteMany();
        
        console.log('🗑️  Deleting customers...');
        await prisma.customer.deleteMany();
        
        console.log('\n✅ Test data cleaned successfully!');
      } catch (error) {
        console.error('❌ Error cleaning data:', error);
      }
    } else {
      console.log('Cleanup cancelled.');
    }
    
    await prisma.$disconnect();
    rl.close();
    process.exit(0);
  });
}

cleanup();