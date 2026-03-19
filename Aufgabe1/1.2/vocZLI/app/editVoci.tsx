import * as FileSystem from "expo-file-system/legacy";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useVoci } from "../context/vociContext";
import VociDetail from "../components/VociDetail";
import Voci from "../models/voci";

export default function EditVoci() {
  const router = useRouter();
  const { term } = useLocalSearchParams<{ term: string }>();
  const { vociList, updateVoci, removeVoci } = useVoci();

  const voci = vociList.find((v) => v.term === term);

  async function handleSave(updatedVoci: Voci) {
    if (term) {
      if (voci?.imageUri && voci.imageUri !== updatedVoci.imageUri) {
        try {
          await FileSystem.deleteAsync(voci.imageUri, { idempotent: true });
        } catch {}
      }
      updateVoci(term, updatedVoci);
    }
    router.back();
  }

  function handleCancel() {
    router.back();
  }

  async function handleDelete() {
    if (voci?.imageUri) {
      try {
        await FileSystem.deleteAsync(voci.imageUri, { idempotent: true });
      } catch {}
    }
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
