// seed.js - generate demo data for convincing charts
import { Storage } from './storage.js';
import { Utils } from './utils.js';

export const Seed = {
  demo(){
    const now = new Date();
    const monthsBack = 8;
    const cats = Storage.loadCategories();
    const tx = [];

    function rnd(a,b){ return Math.random()*(b-a)+a; }
    function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

    for(let m=monthsBack; m>=0; m--){
      const d = new Date(now.getFullYear(), now.getMonth()-m, 1);
      // incomes
      for(let i=0;i<2;i++){
        tx.push({
          id: Utils.uid(), type: "income",
          amount: Number((rnd(700, 1600)).toFixed(2)),
          category: "Salary",
          note: "Monthly income",
          date: new Date(d.getFullYear(), d.getMonth(), Math.floor(rnd(1,5))).toISOString()
        });
      }
      // expenses
      for(let i=0;i<10;i++){
        const c = pick(cats);
        tx.push({
          id: Utils.uid(), type: "expense",
          amount: Number((rnd(5, 120)).toFixed(2)),
          category: c,
          note: "Auto-generated",
          date: new Date(d.getFullYear(), d.getMonth(), Math.floor(rnd(5,27))).toISOString()
        });
      }
    }
    const cur = Storage.loadData();
    Storage.saveData(cur.concat(tx));
  }
};
