// Beløp lagres som hele øre. Timer og prosent lagres i hundredeler.
window.EconomyModel = (() => {
  const MAX_MONEY = 1000000000000;
  const money = new Intl.NumberFormat('nb-NO',{style:'currency',currency:'NOK',minimumFractionDigits:0,maximumFractionDigits:2});
  function parse(value, max = MAX_MONEY) {
    if (value === null || String(value).trim() === '') return null;
    let text = String(value).trim().replace(/[\s\u00a0\u202f]/g,'');
    if (text.includes(',')) text = text.replace(/\./g,'').replace(',','.');
    else if (/^\d{1,3}(\.\d{3})+$/.test(text)) text = text.replace(/\./g,'');
    if (!/^\d+(\.\d{1,2})?$/.test(text)) throw new Error('Bruk et positivt tall med høyst to desimaler.');
    const [whole,fraction=''] = text.split('.');
    const result = Number(whole)*100 + Number(fraction.padEnd(2,'0'));
    if (!Number.isSafeInteger(result) || result > max) throw new Error('Beløpet er for stort.');
    return result;
  }
  function validate(raw) {
    const invalid = () => {throw new Error('Økonomidelen i prosjektfilen er ugyldig eller har en ukjent versjon.');};
    if (!raw || raw.schema !== 1 || !Array.isArray(raw.items) || raw.items.length > 100 || typeof raw.notes !== 'string' || raw.notes.length > 2000) invalid();
    const number = (value,max=MAX_MONEY,nullable=true) => {if (value===null && nullable) return null;if (!Number.isSafeInteger(value) || value<0 || value>max) invalid();return value;};
    const ids = new Set();
    const items = raw.items.map(item => {
      if (!item || typeof item.id !== 'string' || !item.id || item.id.length>80 || ids.has(item.id) || typeof item.label !== 'string' || item.label.length>120 || !['time','fixed'].includes(item.kind)) invalid();
      ids.add(item.id);
      const row = {id:item.id,label:item.label,kind:item.kind,hours100:number(item.hours100,1000000),rateOre:number(item.rateOre),amountOre:number(item.amountOre),spentOre:number(item.spentOre)};
      if (row.kind==='time' && row.hours100!==null && row.rateOre!==null && (BigInt(row.hours100)*BigInt(row.rateOre)+50n)/100n>BigInt(MAX_MONEY)) invalid();
      return row;
    });
    const value = {schema:1,budgetOre:number(raw.budgetOre),reserveBp:number(raw.reserveBp,10000,false),notes:raw.notes,items};
    if (typeof raw.updatedAt==='string' && raw.updatedAt.length<=40 && Number.isFinite(Date.parse(raw.updatedAt))) value.updatedAt=raw.updatedAt;
    return value;
  }
  function totals(value) {
    const planned = item => item.kind==='fixed' ? item.amountOre : item.hours100===null || item.rateOre===null ? null : Number((BigInt(item.hours100)*BigInt(item.rateOre)+50n)/100n);
    const plannedOre = value.items.reduce((sum,item)=>sum+(planned(item)??0),0);
    const spentOre = value.items.reduce((sum,item)=>sum+(item.spentOre??0),0);
    const reserveOre = value.budgetOre===null ? null : Number((BigInt(value.budgetOre)*BigInt(value.reserveBp)+5000n)/10000n);
    const allocatedOre = reserveOre===null ? null : plannedOre+reserveOre;
    return {plannedOre,spentOre,reserveOre,allocatedOre,marginOre:allocatedOre===null ? null : value.budgetOre-allocatedOre,incomplete:value.items.filter(item=>planned(item)===null).length,spentCount:value.items.filter(item=>item.spentOre!==null).length,planned};
  }
  function empty() {return {schema:1,budgetOre:null,reserveBp:0,notes:'',items:[]};}
  return {parse,validate,totals,empty,format:value=>value===null?'–':money.format(value/100),input:value=>value===null?'':String(value/100).replace('.',','),MAX_MONEY};
})();
