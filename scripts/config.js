export const SODL_CONFIG = {
  resources: {
    chancePoints: {
      maximum: 6,
      minValue: 0,
      description: "Points de chance utilisables par les joueurs"
    }
  },

  chancePointsRules: {
    reserve: "Réserve de 1d3+3 points par aventure pour le groupe.",
    gains: "Également gagnés par des actions remarquables, de bonnes idées, une bonne interprétation...",
    uses: [
      "Transformer un échec en succès et inversement",
      "Gagner 1 Action supplémentaire (restriction sur le tour en cours)",
      "Dépenser un point de chance pour récupérer 2x votre Vitesse de Guérison se fait durant votre tour et consomme votre action. C'est un effort héroïque pour vous remettre sur pied, mais vous ne pouvez pas attaquer en même temps.",
      "Changer 1d6 (avantage ou désavantage) en 1 ou 6"
    ],
    gmUses: [
      "Survivre à un coup mortel",
      "Dépenser une utilisation d'un sort pour en lancer un autre (équivalent)",
      "Éviter une Marque des ténèbres",
    ]
  },

  afflictions: {
    list: [
      { id: "weakened", name: "Affaibli", description: "Les jets subissent +1 Desav (Désavantage)." },
      { id: "deafened", name: "Assourdi", description: "N'entends rien (les jets de Perception basés sur l'ouïe échouent)." },
      { id: "prone", name: "À terre", description: "Force/Agilité +1 Desav. Les adversaires gagnent 1 Av pour attaquer le PJ en mêlée, et 1 Desav à distance. Se relever coûte le déplacement ou une action." },
      { id: "blinded", name: "Aveuglé", description: "Vitesse maximum 2, ne voit rien." },
      { id: "frightened", name: "Effrayé", description: "Jet +1 Desav (+3 si en voit la source), ne peut pas faire de tours rapides." },
      { id: "poisoned", name: "Empoisonné", description: "Jets +1 Desav." },
      { id: "asleep", name: "Endormi", description: "À terre + inconscient. Une créature peut utiliser une action pour réveiller le PJ. Prendre des dégâts réveille." },
      { id: "dazed", name: "Étourdi", description: "Aucune action possible." },
      { id: "fatigued", name: "Fatigué", description: "Jets +1 Desav." },
      { id: "immobilized", name: "Immobilisé", description: "Vitesse 0 et +1 Av pour attaquer le PJ." },
      { id: "unconscious", name: "Inconscient", description: "Défense 5, aucune action ni déplacement." },
      { id: "diseased", name: "Malade", description: "Jets +1 Desav." },
      { id: "slowed", name: "Ralenti", description: "Vitesse/2, tours lents uniquement." },
      { id: "stupefied", name: "Stupéfait", description: "Ne peut pas agir/se déplacer, +1 Av pour l'attaquer." },
      { id: "surprised", name: "Surpris", description: "Ne peut pas agir/se déplacer (pour ce round)." },
      { id: "vulnerable", name: "Vulnérable", description: "Ne peut pas agir, Défense de 5, tout jet échoue (sauf Perception)." }
    ]
  },

  actions: {
    list: [
      { name: "Attaquer / Lancer un sort / Recharger une arme", description: "Effectue une action non-listée ici selon ce qu'imagine le joueur." },
      { name: "Aider", description: "Test d'Intellect pour donner +1 Av à une créature." },
      { name: "Se préparer", description: "Déclarer une action et un déclencheur. Si l'action se déclenche, les jets liés à cette action ont +1 Av." },
      { name: "Battre en retraite", description: "Vitesse/2, évite les attaques gratuites." },
      { name: "Chercher", description: "Trouver et partager la position d'une créature dissimulée." },
      { name: "Garder la concentration", description: "Sur un sort. Elle est perdue si le personnage prend des dégâts et échoue un jet de Volonté, ou fait autre chose." },
      { name: "Révoquer", description: "L'effet d'un sort encore actif lancé par le PJ." },
      { name: "Se cacher", description: "Derrière un abri, dans l'ombre... Une créature ne voyant pas le PJ a 3 Desav contre lui, et le PJ +1 Av contre elle." },
      { name: "Se défendre", description: "Les attaques des adversaires subissent +1 Desav et le PJ gagne +1 Av pour ses jets défensifs." },
      { name: "Sprinter", description: "Se déplacer au double de la Vitesse." },
      { name: "Stabiliser", description: "Jet d'Intellect (1 Desav si la créature agonise) pour soigner 1 dégât sur une créature hors-combat." },
      { name: "Utiliser un objet / Recharger", description: "Utilise un objet ou recharge une arme." }
    ]
  },

  meleeOptions: {
    list: [
      { name: "Attaque de dégagement", description: "+1 Desav. Si réussie, pas d'attaque gratuite de la cible contre le PJ durant ce round." },
      { name: "Attaque défensive", description: "+1 Desav, la prochaine attaque ciblant le PJ subit 1 Desav." },
      { name: "Attaque déstabilisante", description: "+1 Désav, une cible de gabarit inférieur ou égal tombe si elle échoue son jet d'Agilité." },
      { name: "Attaque en fente", description: "+1 Désav, Allonge +1 mètre." },
      { name: "Attaque entraînante", description: "+1 Désav, mouvement de [mod Force] mètres entraînant la cible." }
    ]
  },

  rangedOptions: {
    list: [
      { name: "Tir de précision", description: "+2 Desav pour viser une partie précise (par exemple les yeux pour imposer 1 Désavantage)." },
      { name: "Tir distant", description: "+1 Desav pour tirer au-delà de la portée normale." },
      { name: "Tir renversant", description: "+2 Desav contre une cible de gabarit inférieur ou égal ; elle tombe si elle échoue son jet d'Agilité." }
    ]
  },

  otherAttacks: {
    list: [
      { name: "Avec deux armes", description: "+2 Desav, inflige les dégâts des 2 armes. Ou 3 Desav si 2 attaques contre 2 cibles différentes." },
      { name: "Désarmer", description: "Jet d'Agilité/Force contre Agilité/Force (2 Desav si effectué sans arme)." },
      { name: "Distraire", description: "Jet d'attaque d'Intellect pour imposer 2 Desav sur le prochain jet de la cible." },
      { name: "Saisir", description: "Jet Agilité/Force contre Agilité. Coûte une action à chaque round pour maintenir." },
      { name: "Se libérer", description: "Si saisi : jet Agilité/Force contre Force." },
      { name: "Feinter", description: "Agilité contre Perception. Donne 2 Avantages pour le prochain jet du personnage contre la Défense ou l'Agilité de la cible, ou évite les attaques gratuites." },
      { name: "Renverser (debout)", description: "Force contre Agilité (+1 Desav par gabarit plus grand, +1 Av si plus petit) pour faire chuter la cible." },
      { name: "Renverser (saisi)", description: "Force contre Force pour une cible saisie pas plus grande. Si succès, déplacement à Vitesse/2." },
      { name: "Pousser", description: "Force contre Force (+1 Desav par gabarit plus grand, +1 Av si plus petit). Pousse de 1 + [mod Force] mètres." },
      { name: "Charger", description: "Déplacement, inflige 1 Desav sur tous les jets ce round-ci. Donne le droit d'attaquer, pousser ou renverser." }
    ]
  },

  situationalRules: {
    list: [
      { name: "Abris / Couvert", description: "Peut donner 1 ou 2 Désavantages aux attaques des adversaires, voire les faire échouer si c'est un abri total." },
      { name: "Obscurité", description: "Une zone partiellement / fortement / totalement obscure inflige 1 / 2 / 3 Désavantages aux attaques." }
    ]
  },

  outOfCombat: {
    content: "Un PJ hors de combat est vulnérable et doit faire des jets de destinée (1d6) chaque round. Il peut devenir agonisant (1), se relever affaibli (6), ou rester inconscient quelques heures (au bout de 3 rounds). Un PJ agonisant effectue ses jets et peut mourir (1), ou redevenir hors de combat (6). État blessé : à partir de Santé/2."
  },

  madness: {
    content: "Cumuler de la folie : au moment où le PJ gagne des points de Folie, il devient effrayé durant Folie totale rounds. S'il l'est déjà, jet de Volonté pour ne pas être stupéfait durant un round. Devenir fou : si la Folie totale atteint la Volonté, le PJ subit une Démence puis perd 1d6 + [mod Volonté] points de folie."
  },

  corruption: {
    content: "Cumuler de la corruption : en commettant des actes atroces. Tirez ensuite 1d20 et obtenez une Marque des ténèbres si le jet ne dépasse pas la Corruption totale. Effets : à partir de 4 Corruption, le PJ subit des effets supplémentaires."
  },

  spellcasting: {
    formula: "Il faut la prononcer, donc pouvoir parler.",
    focus: "Il faut la brandir. C'est un objet comme une baguette, une amulette, un grimoire...",
    useCost: "Dépenser une utilisation, regagnée après un repos.",
    nonConsenting: "Cible non consentante : faire un jet d'Attaque (d'Intellect ou de Volonté) contre l'Agilité de la cible.",
    incantation: {
      description: "Ce sont des formules écrites sur un parchemin, gravées, peintes...",
      cast: "Pour la lancer : jet d'Intellect. Ensuite, l'incantation est détruite.",
      powerVsLevel: "Si le niveau du sort dépasse la Puissance du PJ, le jet subit autant de Désavantages que de différence.",
      higherPower: "Si la Puissance du PJ est plus grande, pas besoin de faire de jet."
    },
    usesTable: {
      header: ["Puissance \\ Niveau", "0", "1", "2", "3", "4", "5", "6+"],
      rows: [
        [0, "1", "—", "—", "—", "—", "—", "—"],
        [1, "2", "1", "—", "—", "—", "—", "—"],
        [2, "3", "2", "1", "—", "—", "—", "—"],
        [3, "4", "2", "1", "1", "—", "—", "—"],
        [4, "5", "2", "2", "1", "1", "—", "—"],
        [5, "6", "3", "2", "2", "1", "1", "—"],
        [6, "7", "3", "2", "2", "2", "1", "1"],
        [7, "8", "3", "2", "2", "2", "1", "1"],
        [8, "9", "3", "3", "2", "2", "2", "1"]
      ]
    }
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
