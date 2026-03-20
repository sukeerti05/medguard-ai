// Simple example dataset
const interactions = [
  ["Aspirin", "Ibuprofen"],
  ["Paracetamol", "Methotrexate"]
];

export default {
  checkInteractions: (medicines) => {
    const warnings = [];
    for (let i = 0; i < medicines.length; i++) {
      for (let j = i + 1; j < medicines.length; j++) {
        if (interactions.some(pair =>
          pair.includes(medicines[i]) && pair.includes(medicines[j])
        )) {
          warnings.push(`${medicines[i]} may interact with ${medicines[j]}`);
        }
      }
    }
    return warnings;
  }
};
