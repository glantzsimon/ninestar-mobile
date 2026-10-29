import { Stack } from 'expo-router';
import { KnowledgeBaseProvider } from '@/components/knowledge-base-provider';

export default function KnowledgeBaseLayout() {
  return <KnowledgeBaseProvider><Stack screenOptions={{ headerShown: false }} /></KnowledgeBaseProvider>;
}
