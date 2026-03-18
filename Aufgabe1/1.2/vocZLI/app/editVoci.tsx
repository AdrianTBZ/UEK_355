import { useLocalSearchParams, useRouter } from "expo-router";
import { useVoci } from "../context/vociContext";
import VociDetail from "../components/VociDetail";
import Voci from "../models/voci";

export default function EditVoci() {
  const router = useRouter();
  const { term } = useLocalSearchParams<{ term: string }>();
  const { vociList, updateVoci, removeVoci } = useVoci();

  const voci = vociList.find((v) => v.term === term);

  function handleSave(updatedVoci: Voci) {
    if (term) {
      updateVoci(term, updatedVoci);
    }
    router.back();
  }

  function handleCancel() {
    router.back();
  }

  function handleDelete() {
    if (term) {
      removeVoci(term);
    }
    router.back();
  }

  return (
    <VociDetail
      voci={voci}
      onSave={handleSave}
      onCancel={handleCancel}
      onDelete={handleDelete}
    />
  );
}
