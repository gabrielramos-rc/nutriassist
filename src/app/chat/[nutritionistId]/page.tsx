import { notFound } from "next/navigation";
import { ChatWidget } from "@/components/chat";
import { getNutritionist } from "@/services/patients";
import { RESPONSE_TEMPLATES } from "@/constants/nina";

interface ChatPageProps {
  params: Promise<{
    nutritionistId: string;
  }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { nutritionistId } = await params;

  // Load nutritionist
  const nutritionist = await getNutritionist(nutritionistId);

  if (!nutritionist) {
    notFound();
  }

  // Generate initial greeting
  const initialGreeting = RESPONSE_TEMPLATES.greeting(nutritionist.name);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md h-[600px]">
        <ChatWidget
          nutritionistId={nutritionistId}
          nutritionistName={nutritionist.name}
          initialGreeting={initialGreeting}
        />
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: ChatPageProps) {
  const { nutritionistId } = await params;
  const nutritionist = await getNutritionist(nutritionistId);

  if (!nutritionist) {
    return { title: "Chat não encontrado" };
  }

  return {
    title: `Chat com ${nutritionist.name} - NutriAssist`,
    description: `Converse com a Nina, assistente virtual da ${nutritionist.name}`,
  };
}
