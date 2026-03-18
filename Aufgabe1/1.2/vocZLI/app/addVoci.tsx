import { useRouter } from "expo-router";
import Voci from "../models/voci";
import { useVoci } from "../context/vociContext";
import VociDetail from "../components/VociDetail";

export default function AddVoci() {
  const router = useRouter();
  const { addVoci } = useVoci();

  function handleAdd(newVoci: Voci) {
    addVoci(newVoci);
    router.back();
  }

  return <VociDetail onSave={handleAdd} />;
}
