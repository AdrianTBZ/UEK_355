import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Voci from '../models/voci';

const STORAGE_KEY = 'vociList';

const DEFAULT_VOCI: Voci[] = [
  { term: "apple", translation: "Apfel" },
  { term: "car", translation: "Auto" },
  { term: "house", translation: "Haus" },
  { term: "dog", translation: "Hund" },
  { term: "book", translation: "Buch" },
  { term: "water", translation: "Wasser" },
  { term: "table", translation: "Tisch" },
  { term: "chair", translation: "Stuhl" },
  { term: "window", translation: "Fenster" },
  { term: "school", translation: "Schule" },
];

interface VociContextType {
  vociList: Voci[];
  isLoading: boolean;
  addVoci: (voci: Voci) => void;
  updateVoci: (term: string, updatedVoci: Voci) => void;
  removeVoci: (term: string) => void;
}

const VociContext = createContext<VociContextType | undefined>(undefined);

export function VociProvider({ children }: { children: ReactNode }) {
  const [vociList, setVociList] = useState<Voci[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Beim Start: Daten aus AsyncStorage laden
  useEffect(() => {
    async function loadVoci() {
      try {
        const stored = await AsyncStorage.getItem('vocis');
        if (stored !== null) {
          setVociList(JSON.parse(stored));
          console.log('Vocis geladen');
        } else {
          setVociList(DEFAULT_VOCI);
          console.log('Keine gespeicherten Vocis gefunden, Standard geladen');
        }
      } catch (error) {
        console.log('Fehler beim Laden:', error);
        setVociList(DEFAULT_VOCI);
      } finally {
        setIsLoading(false);
      }
    }
    loadVoci();
  }, []);

  // Bei jeder Änderung: Daten in AsyncStorage speichern
  useEffect(() => {
    async function saveVoci() {
      try {
        const json = JSON.stringify(vociList);
        await AsyncStorage.setItem('vocis', json);
        console.log('Vocis gespeichert');
      } catch (error) {
        console.log('Fehler beim Speichern:', error);
      }
    }
    saveVoci();
  }, [vociList]);

  function addVoci(voci: Voci) {
    setVociList((prev) => [...prev, voci]);
  }

  function updateVoci(term: string, updatedVoci: Voci) {
    setVociList((prev) =>
      prev.map((v) => (v.term === term ? updatedVoci : v))
    );
  }

  function removeVoci(term: string) {
    setVociList((prev) => prev.filter((v) => v.term !== term));
  }

  return (
    <VociContext.Provider value={{ vociList, isLoading, addVoci, updateVoci, removeVoci }}>
      {children}
    </VociContext.Provider>
  );
}

export function useVoci() {
  const context = useContext(VociContext);
  if (!context) {
    throw new Error('useVoci muss innerhalb von VociProvider verwendet werden');
  }
  return context;
}
