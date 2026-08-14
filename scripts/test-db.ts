import 'dotenv/config';
import { db } from "../src/lib/db";

(async function main(){
  try{
    const rows = await db.feedback.findMany({ where: { deletedAt: null }, take: 1 });
    console.log('ok', rows.length);
  }catch(e:any){
    console.error('error', e.name, e.message);
    console.error(e);
    process.exit(1);
  }
})();
