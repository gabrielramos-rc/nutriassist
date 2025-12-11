/**
 * Seed script to create a test nutritionist
 * Run with: npm run seed
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables from .env.local
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing environment variables. Make sure .env.local exists.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log("🌱 Seeding test nutritionist...\n");

  // Create test nutritionist (use fixed UUID for consistent testing)
  const nutritionistId = "11111111-1111-1111-1111-111111111111";

  const { data: nutritionist, error: nutritionistError } = await supabase
    .from("nutritionists")
    .upsert(
      {
        id: nutritionistId,
        name: "Dra. Ana Silva",
        email: "ana.silva@nutriassist.com",
        phone: "(11) 99999-9999",
        business_hours: {
          monday: { start: "08:00", end: "18:00", enabled: true },
          tuesday: { start: "08:00", end: "18:00", enabled: true },
          wednesday: { start: "08:00", end: "18:00", enabled: true },
          thursday: { start: "08:00", end: "18:00", enabled: true },
          friday: { start: "08:00", end: "17:00", enabled: true },
          saturday: { start: "08:00", end: "12:00", enabled: false },
          sunday: { start: "08:00", end: "12:00", enabled: false },
        },
        faq_responses: {
          price: "O valor da consulta é R$ 280,00 (primeira consulta) e R$ 180,00 (retorno). Aceito PIX, cartão de crédito e débito.",
          location: "Meu consultório fica na Av. Paulista, 1000 - Sala 501, Bela Vista, São Paulo/SP. Próximo ao metrô Trianon-MASP.",
          preparation: "Para a primeira consulta, traga exames de sangue recentes (se tiver), lista de medicamentos que usa e venha com roupas leves para as medidas corporais.",
          duration: "A primeira consulta dura aproximadamente 1 hora. Os retornos duram cerca de 30-40 minutos.",
          online: "Sim! Atendo online por videochamada. A consulta online tem o mesmo valor e você recebe o plano alimentar por email.",
        },
        appointment_duration: 60,
      },
      { onConflict: "id" }
    )
    .select()
    .single();

  if (nutritionistError) {
    console.error("❌ Error creating nutritionist:", nutritionistError);
    return;
  }

  console.log("✅ Nutritionist created:");
  console.log(`   ID: ${nutritionist.id}`);
  console.log(`   Name: ${nutritionist.name}`);
  console.log(`   Email: ${nutritionist.email}\n`);

  // Create test patient (use fixed UUID for consistent testing)
  const patientId = "22222222-2222-2222-2222-222222222222";

  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .upsert(
      {
        id: patientId,
        nutritionist_id: nutritionist.id,
        name: "João Santos",
        email: "joao.santos@email.com",
        phone: "(11) 98888-8888",
        diet_extracted_text: `
PLANO ALIMENTAR - João Santos
Elaborado por: Dra. Ana Silva - CRN 12345

OBJETIVO: Emagrecimento saudável e ganho de massa muscular

CAFÉ DA MANHÃ (7h)
- 2 fatias de pão integral
- 2 ovos mexidos
- 1 fatia de queijo branco
- 1 copo de café com leite desnatado
- 1 fruta (maçã, pera ou banana)

LANCHE DA MANHÃ (10h)
- 1 iogurte natural
- 1 colher de sopa de granola
- OU 1 fruta + 5 castanhas

ALMOÇO (12h30)
- 4 colheres de sopa de arroz integral
- 1 concha de feijão
- 150g de proteína (frango, peixe ou carne magra)
- Salada à vontade (folhas verdes, tomate, pepino)
- 1 colher de sopa de azeite
- Legumes cozidos (brócolis, cenoura, abobrinha)

LANCHE DA TARDE (15h30)
- 1 fatia de pão integral com pasta de amendoim
- OU 1 shake proteico com frutas

JANTAR (19h)
- Similar ao almoço, mas com porção menor de carboidrato
- 2 colheres de arroz OU 1 batata doce média
- 150g de proteína
- Salada à vontade

CEIA (21h30) - Opcional
- 1 copo de leite desnatado
- OU 1 iogurte natural

SUBSTITUIÇÕES PERMITIDAS:
- Frango pode ser trocado por: peixe, atum, carne magra
- Arroz pode ser trocado por: quinoa, batata doce, mandioca
- Pão integral pode ser trocado por: tapioca, crepioca

ÁGUA: Mínimo 2 litros por dia

OBSERVAÇÕES:
- Evitar frituras e alimentos ultraprocessados
- Preferir preparações grelhadas, assadas ou cozidas
- Mastigar bem os alimentos
- Fazer as refeições sem distrações

Próximo retorno: em 30 dias
`,
      },
      { onConflict: "id" }
    )
    .select()
    .single();

  if (patientError) {
    console.error("❌ Error creating patient:", patientError);
    return;
  }

  console.log("✅ Patient created:");
  console.log(`   ID: ${patient.id}`);
  console.log(`   Name: ${patient.name}`);
  console.log(`   Email: ${patient.email}\n`);

  console.log("🎉 Seed complete!\n");
  console.log("Test your chat at:");
  console.log(`   Local: http://localhost:3000/chat/${nutritionist.id}`);
  console.log(`   Prod:  https://nutriassist-one.vercel.app/chat/${nutritionist.id}\n`);
}

seed().catch(console.error);
