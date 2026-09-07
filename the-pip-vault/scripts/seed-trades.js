const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Read environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error("Error: .env.local file not found at project root!");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    // Remove quotes if present
    if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SERVICE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL or SERVICE_KEY missing in .env.local!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    persistSession: false
  }
});

// Configure the user ID we want to seed data for
const TARGET_USER_ID = "b688bd83-90e8-4c7e-8672-6ba150760941";
// Previous user ID we seeded to by accident and want to clean up
const CLEANUP_USER_ID = "45cbd8f7-bdde-4260-a4b5-d74c12c8f6ee";

async function main() {
  console.log("Connecting to Supabase...");

  // --- 1. CLEANUP PREVIOUS SEED FROM mobileracer93 ---
  console.log(`Cleaning up accidental seed for user ${CLEANUP_USER_ID}...`);
  
  // Delete trades
  const { error: deleteTradesError } = await supabase
    .from('trades')
    .delete()
    .eq('user_id', CLEANUP_USER_ID);
  
  if (deleteTradesError) {
    console.warn("Warning cleaning up trades:", deleteTradesError.message);
  }

  // Delete the default account we created
  const { error: deleteAccountError } = await supabase
    .from('accounts')
    .delete()
    .eq('user_id', CLEANUP_USER_ID)
    .eq('name', "FTMO 100k Challenge");
  
  if (deleteAccountError) {
    console.warn("Warning cleaning up account:", deleteAccountError.message);
  }
  console.log("Cleanup completed.");

  // --- 2. GET USER DETAILS ---
  const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(TARGET_USER_ID);
  if (userError || !user) {
    console.error(`Error: User with ID ${TARGET_USER_ID} not found in Auth!`);
    process.exit(1);
  }
  console.log(`Targeting user: ${user.email} (${user.id})`);

  // --- 3. FETCH OR CREATE ACCOUNT ---
  const { data: accounts, error: accountsError } = await supabase
    .from('accounts')
    .select('id, name, type, currency')
    .eq('user_id', TARGET_USER_ID)
    .limit(1);

  let account;
  if (accountsError || !accounts || accounts.length === 0) {
    console.log("No accounts found for target user. Creating a default account...");
    const { data: newAccount, error: createAccountError } = await supabase
      .from('accounts')
      .insert({
        name: "FTMO 100k Challenge",
        type: "Prop Funded",
        start_amount: 100000,
        currency: "USD",
        status: "active",
        is_default: true,
        user_id: TARGET_USER_ID
      })
      .select()
      .maybeSingle();

    if (createAccountError || !newAccount) {
      console.error("Error creating default account:", createAccountError ? createAccountError.message : "Failed to return created account.");
      process.exit(1);
    }
    account = newAccount;
    console.log(`Created default account: ${account.name} (${account.id})`);
  } else {
    account = accounts[0];
    console.log(`Using existing account: ${account.name} (${account.id})`);
  }

  // --- 4. GENERATE 100 TRADING DAYS ---
  const tradingDays = [];
  let currentDate = new Date();
  
  while (tradingDays.length < 100) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      tradingDays.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() - 1);
  }

  tradingDays.reverse();

  console.log(`Generating trades from ${tradingDays[0].toDateString()} to ${tradingDays[tradingDays.length - 1].toDateString()}...`);

  const pairs = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD"];
  const strategies = ["Trend Continuation", "Reversal", "Breakout", "RSI Divergence"];
  const emotions = ["Neutral", "Confident", "Anxious", "FOMO", "Revenge Trading"];

  const insertions = [];

  tradingDays.forEach(day => {
    for (let i = 1; i <= 2; i++) {
      const pair = pairs[Math.floor(Math.random() * pairs.length)];
      const direction = Math.random() > 0.5 ? "LONG" : "SHORT";
      const isJPY = pair.includes("JPY");
      
      let entryPrice = 0;
      if (pair === "EURUSD") entryPrice = 1.0800 + Math.random() * 0.02;
      else if (pair === "GBPUSD") entryPrice = 1.2600 + Math.random() * 0.02;
      else if (pair === "USDJPY") entryPrice = 150.00 + Math.random() * 5.0;
      else if (pair === "AUDUSD") entryPrice = 0.6500 + Math.random() * 0.02;
      else if (pair === "USDCAD") entryPrice = 1.3400 + Math.random() * 0.02;

      const rand = Math.random();
      let pnl = 0;
      let isBreakeven = false;
      let exitPrice = entryPrice;

      const pipMultiplier = isJPY ? 0.01 : 0.0001;
      const targetPips = 20 + Math.floor(Math.random() * 30);

      if (rand < 0.55) {
        pnl = 150 + Math.floor(Math.random() * 250);
        const change = targetPips * pipMultiplier;
        exitPrice = direction === "LONG" ? entryPrice + change : entryPrice - change;
      } else if (rand < 0.90) {
        pnl = -(50 + Math.floor(Math.random() * 100));
        const change = (targetPips / 2) * pipMultiplier;
        exitPrice = direction === "LONG" ? entryPrice - change : entryPrice + change;
      } else {
        isBreakeven = true;
        pnl = 0;
        exitPrice = entryPrice;
      }

      const commission = 3.00 + Math.random() * 2.00;
      const swap = Math.random() > 0.8 ? 1.00 + Math.random() * 2.00 : 0.00;

      const tradeDate = new Date(day);
      if (i === 1) {
        tradeDate.setHours(9 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
      } else {
        tradeDate.setHours(14 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
      }

      const exitDate = new Date(tradeDate);
      exitDate.setHours(exitDate.getHours() + 1 + Math.floor(Math.random() * 3));

      insertions.push({
        user_id: TARGET_USER_ID,
        account_id: account.id,
        account_type: `${account.name} (${account.type})`,
        date: tradeDate.toISOString(),
        exit_date: exitDate.toISOString(),
        pair,
        direction,
        entry_price: parseFloat(entryPrice.toFixed(isJPY ? 3 : 5)),
        exit_price: parseFloat(exitPrice.toFixed(isJPY ? 3 : 5)),
        stop_loss: parseFloat((direction === "LONG" ? entryPrice - (20 * pipMultiplier) : entryPrice + (20 * pipMultiplier)).toFixed(isJPY ? 3 : 5)),
        take_profit: parseFloat((direction === "LONG" ? entryPrice + (40 * pipMultiplier) : entryPrice - (40 * pipMultiplier)).toFixed(isJPY ? 3 : 5)),
        pnl_currency: pnl,
        commission: parseFloat(commission.toFixed(2)),
        swap: parseFloat(swap.toFixed(2)),
        pnl: parseFloat((pnl - commission - swap).toFixed(2)),
        setup: strategies[Math.floor(Math.random() * strategies.length)],
        emotion: emotions[Math.floor(Math.random() * emotions.length)],
        session: i === 1 ? "London" : "New York",
        asset_type: "forex",
        is_breakeven: isBreakeven,
        rr_ratio: 2.00
      });
    }
  });

  console.log(`Inserting ${insertions.length} trades into database for target user...`);

  const batchSize = 50;
  for (let i = 0; i < insertions.length; i += batchSize) {
    const batch = insertions.slice(i, i + batchSize);
    const { error: insertError } = await supabase.from('trades').insert(batch);
    
    if (insertError) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, insertError.message);
      process.exit(1);
    }
    console.log(`Inserted trades ${i + 1} to ${Math.min(i + batchSize, insertions.length)}...`);
  }

  console.log(`Success! Database seeded with 200 trades for user ${user.email} (${TARGET_USER_ID})`);
}

main();
