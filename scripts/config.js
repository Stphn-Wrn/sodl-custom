export const SODL_CONFIG = {
  resources: {
    chancePoints: {
      maximum: 6,
      minValue: 0,
      description: "Points de chance utilisables par les joueurs"
    }
  },

  afflictions: {
    list: [
      {
        id: "weakened",
        name: "Affaibli",
        description: "les jets subissent +1 Desav"
      },
      {
        id: "deafened",
        name: "Assourdi",
        description: "n'entends rien (les jet Perception basé sur l'ouïe échouent)"
      },
      {
        id: "prone",
        name: "À terre",
        description: "Force/Agilité +1 Desav. Adversaires gagnent 1 Av pour attaquer le PJ en mêlée"
      },
      {
        id: "blinded",
        name: "Aveugle",
        description: "Vitesse maximum 2, ne voir rien"
      },
      {
        id: "frightened",
        name: "Effrayé",
        description: "jet +1 Desav (+3 si en voit la source), ne peut pas faire de tours rapides"
      },
      {
        id: "poisoned",
        name: "Empoisonné",
        description: "jets +1 Desav"
      },
      {
        id: "asleep",
        name: "Endormi",
        description: "à terre + inconsistant. Une créature peut utiliser une action pour réveiller le PJ"
      },
      {
        id: "stunned",
        name: "Étourdi",
        description: "aucune action ni déplacement"
      },
      {
        id: "dazed",
        name: "Étoudi",
        description: "aucune action possible"
      },
      {
        id: "fatigued",
        name: "Fatigué",
        description: "jets +1 Desav"
      },
      {
        id: "immobilized",
        name: "Immobilisé",
        description: "Vitesse 0 et +1 Av pour attaquer le PJ"
      },
      {
        id: "unconscious",
        name: "Inconscient",
        description: "Défense 5, aucune action ni déplacement"
      },
      {
        id: "diseased",
        name: "Malade",
        description: "jets +1 Desav"
      },
      {
        id: "slowed",
        name: "Ralenti",
        description: "Vitesse/2, tours lents uniquement"
      },
      {
        id: "stupefied",
        name: "Stupéfait",
        description: "ne peut pas agir/se déplacer, +1 Av pour l'attaque"
      },
      {
        id: "surprised",
        name: "Surpris",
        description: "ne peut pas agir/se déplacer (pour ce round)"
      },
      {
        id: "vulnerable",
        name: "Vulnérable",
        description: "Ne peut pas agir, Défense de 5, tout jet échoue (sauf Perception)"
      }
    ]
  },

  // Configuration des actions
  actions: {
    list: [
      "Attaquer",
      "Lancer un sort",
      "Recharger une arme",
      "Aider",
      "Se préparer",
      "Battre en retraite",
      "Chercher",
      "Garder la concentration",
      "Révoquer un sort",
      "Se cacher",
      "Se défendre",
      "Sprinter",
      "Stabiliser",
      "Utiliser un objet",
      "Recharger"
    ]
  },

  permissions: {
    players: {
      canRead: true,
      canEdit: false,
      canDelete: false
    },
    gm: {
      canRead: true,
      canEdit: true,
      canDelete: true
    }
  },

  ui: {
    buttonPosition: "bottom-right",
    theme: "dark",
    showNotifications: true,
    animationsEnabled: true
  }
};

export default SODL_CONFIG;
