import { localizeTree } from "../../shared/i18n.js";

export const SODL_CONFIG = {
  resources: {
    chancePoints: {
      maximum: 6,
      minValue: 0,
      description: "SODL.Rules.Resources.ChancePoints.Description"
    }
  },
  chancePointsRules: {
    gains: "SODL.Rules.ChancePointsRules.Gains",
    extendedUses: [
      {
        name: "SODL.Rules.ChancePointsRules.ExtendedUses.0.Name",
        description: "SODL.Rules.ChancePointsRules.ExtendedUses.0.Description"
      },
      {
        name: "SODL.Rules.ChancePointsRules.ExtendedUses.1.Name",
        description: "SODL.Rules.ChancePointsRules.ExtendedUses.1.Description"
      },
      {
        name: "SODL.Rules.ChancePointsRules.ExtendedUses.2.Name",
        description: "SODL.Rules.ChancePointsRules.ExtendedUses.2.Description"
      },
      {
        name: "SODL.Rules.ChancePointsRules.ExtendedUses.3.Name",
        description: "SODL.Rules.ChancePointsRules.ExtendedUses.3.Description"
      },
      {
        name: "SODL.Rules.ChancePointsRules.ExtendedUses.4.Name",
        description: "SODL.Rules.ChancePointsRules.ExtendedUses.4.Description"
      },
      {
        name: "SODL.Rules.ChancePointsRules.ExtendedUses.5.Name",
        description: "SODL.Rules.ChancePointsRules.ExtendedUses.5.Description"
      },
      {
        name: "SODL.Rules.ChancePointsRules.ExtendedUses.6.Name",
        description: "SODL.Rules.ChancePointsRules.ExtendedUses.6.Description"
      },
      {
        name: "SODL.Rules.ChancePointsRules.ExtendedUses.7.Name",
        description: "SODL.Rules.ChancePointsRules.ExtendedUses.7.Description"
      }
    ]
  },
  fortuneAwardsTable: {
    title: "SODL.Rules.FortuneAwardsTable.Title",
    subtitle: "SODL.Rules.FortuneAwardsTable.Subtitle",
    header: [
      "SODL.Rules.FortuneAwardsTable.Header.0",
      "SODL.Rules.FortuneAwardsTable.Header.1",
      "SODL.Rules.FortuneAwardsTable.Header.2",
      "SODL.Rules.FortuneAwardsTable.Header.3"
    ],
    rows: [
      [
        "SODL.Rules.FortuneAwardsTable.Rows.0.0",
        8,
        7,
        6
      ],
      [
        "SODL.Rules.FortuneAwardsTable.Rows.1.0",
        7,
        6,
        5
      ],
      [
        "SODL.Rules.FortuneAwardsTable.Rows.2.0",
        6,
        5,
        4
      ],
      [
        "SODL.Rules.FortuneAwardsTable.Rows.3.0",
        4,
        3,
        2
      ]
    ],
    note: "SODL.Rules.FortuneAwardsTable.Note"
  },
  afflictions: {
    list: [
      {
        id: "impaired",
        name: "SODL.Rules.Afflictions.List.Impaired.Name",
        description: "SODL.Rules.Afflictions.List.Impaired.Description"
      },
      {
        id: "deafened",
        name: "SODL.Rules.Afflictions.List.Deafened.Name",
        description: "SODL.Rules.Afflictions.List.Deafened.Description"
      },
      {
        id: "prone",
        name: "SODL.Rules.Afflictions.List.Prone.Name",
        description: "SODL.Rules.Afflictions.List.Prone.Description"
      },
      {
        id: "blinded",
        name: "SODL.Rules.Afflictions.List.Blinded.Name",
        description: "SODL.Rules.Afflictions.List.Blinded.Description"
      },
      {
        id: "charmed",
        name: "SODL.Rules.Afflictions.List.Charmed.Name",
        description: "SODL.Rules.Afflictions.List.Charmed.Description"
      },
      {
        id: "compelled",
        name: "SODL.Rules.Afflictions.List.Compelled.Name",
        description: "SODL.Rules.Afflictions.List.Compelled.Description"
      },
      {
        id: "frightened",
        name: "SODL.Rules.Afflictions.List.Frightened.Name",
        description: "SODL.Rules.Afflictions.List.Frightened.Description"
      },
      {
        id: "poisoned",
        name: "SODL.Rules.Afflictions.List.Poisoned.Name",
        description: "SODL.Rules.Afflictions.List.Poisoned.Description"
      },
      {
        id: "asleep",
        name: "SODL.Rules.Afflictions.List.Asleep.Name",
        description: "SODL.Rules.Afflictions.List.Asleep.Description"
      },
      {
        id: "dazed",
        name: "SODL.Rules.Afflictions.List.Dazed.Name",
        description: "SODL.Rules.Afflictions.List.Dazed.Description"
      },
      {
        id: "fatigued",
        name: "SODL.Rules.Afflictions.List.Fatigued.Name",
        description: "SODL.Rules.Afflictions.List.Fatigued.Description"
      },
      {
        id: "grabbed",
        name: "SODL.Rules.Afflictions.List.Grabbed.Name",
        description: "SODL.Rules.Afflictions.List.Grabbed.Description"
      },
      {
        id: "immobilized",
        name: "SODL.Rules.Afflictions.List.Immobilized.Name",
        description: "SODL.Rules.Afflictions.List.Immobilized.Description"
      },
      {
        id: "unconscious",
        name: "SODL.Rules.Afflictions.List.Unconscious.Name",
        description: "SODL.Rules.Afflictions.List.Unconscious.Description"
      },
      {
        id: "diseased",
        name: "SODL.Rules.Afflictions.List.Diseased.Name",
        description: "SODL.Rules.Afflictions.List.Diseased.Description"
      },
      {
        id: "slowed",
        name: "SODL.Rules.Afflictions.List.Slowed.Name",
        description: "SODL.Rules.Afflictions.List.Slowed.Description"
      },
      {
        id: "stunned",
        name: "SODL.Rules.Afflictions.List.Stunned.Name",
        description: "SODL.Rules.Afflictions.List.Stunned.Description"
      },
      {
        id: "surprised",
        name: "SODL.Rules.Afflictions.List.Surprised.Name",
        description: "SODL.Rules.Afflictions.List.Surprised.Description"
      },
      {
        id: "horrified",
        name: "SODL.Rules.Afflictions.List.Horrified.Name",
        description: "SODL.Rules.Afflictions.List.Horrified.Description"
      },
      {
        id: "defenseless",
        name: "SODL.Rules.Afflictions.List.Defenseless.Name",
        description: "SODL.Rules.Afflictions.List.Defenseless.Description"
      }
    ]
  },
  actions: {
    list: [
      {
        name: "SODL.Rules.Actions.List.0.Name",
        description: "SODL.Rules.Actions.List.0.Description"
      },
      {
        name: "SODL.Rules.Actions.List.1.Name",
        description: "SODL.Rules.Actions.List.1.Description"
      },
      {
        name: "SODL.Rules.Actions.List.2.Name",
        description: "SODL.Rules.Actions.List.2.Description"
      },
      {
        name: "SODL.Rules.Actions.List.3.Name",
        description: "SODL.Rules.Actions.List.3.Description"
      },
      {
        name: "SODL.Rules.Actions.List.4.Name",
        description: "SODL.Rules.Actions.List.4.Description"
      },
      {
        name: "SODL.Rules.Actions.List.5.Name",
        description: "SODL.Rules.Actions.List.5.Description"
      },
      {
        name: "SODL.Rules.Actions.List.6.Name",
        description: "SODL.Rules.Actions.List.6.Description"
      },
      {
        name: "SODL.Rules.Actions.List.7.Name",
        description: "SODL.Rules.Actions.List.7.Description"
      },
      {
        name: "SODL.Rules.Actions.List.8.Name",
        description: "SODL.Rules.Actions.List.8.Description"
      },
      {
        name: "SODL.Rules.Actions.List.9.Name",
        description: "SODL.Rules.Actions.List.9.Description"
      },
      {
        name: "SODL.Rules.Actions.List.10.Name",
        description: "SODL.Rules.Actions.List.10.Description"
      },
      {
        name: "SODL.Rules.Actions.List.11.Name",
        description: "SODL.Rules.Actions.List.11.Description"
      }
    ]
  },
  meleeOptions: {
    list: [
      {
        name: "SODL.Rules.MeleeOptions.List.0.Name",
        description: "SODL.Rules.MeleeOptions.List.0.Description"
      },
      {
        name: "SODL.Rules.MeleeOptions.List.1.Name",
        description: "SODL.Rules.MeleeOptions.List.1.Description"
      },
      {
        name: "SODL.Rules.MeleeOptions.List.2.Name",
        description: "SODL.Rules.MeleeOptions.List.2.Description"
      },
      {
        name: "SODL.Rules.MeleeOptions.List.3.Name",
        description: "SODL.Rules.MeleeOptions.List.3.Description"
      },
      {
        name: "SODL.Rules.MeleeOptions.List.4.Name",
        description: "SODL.Rules.MeleeOptions.List.4.Description"
      }
    ]
  },
  rangedOptions: {
    list: [
      {
        name: "SODL.Rules.RangedOptions.List.0.Name",
        description: "SODL.Rules.RangedOptions.List.0.Description"
      },
      {
        name: "SODL.Rules.RangedOptions.List.1.Name",
        description: "SODL.Rules.RangedOptions.List.1.Description"
      },
      {
        name: "SODL.Rules.RangedOptions.List.2.Name",
        description: "SODL.Rules.RangedOptions.List.2.Description"
      }
    ]
  },
  otherAttacks: {
    list: [
      {
        name: "SODL.Rules.OtherAttacks.List.0.Name",
        description: "SODL.Rules.OtherAttacks.List.0.Description"
      },
      {
        name: "SODL.Rules.OtherAttacks.List.1.Name",
        description: "SODL.Rules.OtherAttacks.List.1.Description"
      },
      {
        name: "SODL.Rules.OtherAttacks.List.2.Name",
        description: "SODL.Rules.OtherAttacks.List.2.Description"
      },
      {
        name: "SODL.Rules.OtherAttacks.List.3.Name",
        description: "SODL.Rules.OtherAttacks.List.3.Description"
      },
      {
        name: "SODL.Rules.OtherAttacks.List.4.Name",
        description: "SODL.Rules.OtherAttacks.List.4.Description"
      },
      {
        name: "SODL.Rules.OtherAttacks.List.5.Name",
        description: "SODL.Rules.OtherAttacks.List.5.Description"
      },
      {
        name: "SODL.Rules.OtherAttacks.List.6.Name",
        description: "SODL.Rules.OtherAttacks.List.6.Description"
      },
      {
        name: "SODL.Rules.OtherAttacks.List.7.Name",
        description: "SODL.Rules.OtherAttacks.List.7.Description"
      },
      {
        name: "SODL.Rules.OtherAttacks.List.8.Name",
        description: "SODL.Rules.OtherAttacks.List.8.Description"
      },
      {
        name: "SODL.Rules.OtherAttacks.List.9.Name",
        description: "SODL.Rules.OtherAttacks.List.9.Description"
      }
    ]
  },
  situationalRules: {
    list: [
      {
        name: "SODL.Rules.SituationalRules.List.0.Name",
        description: "SODL.Rules.SituationalRules.List.0.Description"
      },
      {
        name: "SODL.Rules.SituationalRules.List.1.Name",
        description: "SODL.Rules.SituationalRules.List.1.Description"
      }
    ]
  },
  outOfCombat: {
    content: "SODL.Rules.OutOfCombat.Content"
  },
  madness: {
    content: "SODL.Rules.Madness.Content"
  },
  corruption: {
    content: "SODL.Rules.Corruption.Content"
  },
  spellcasting: {
    formula: "SODL.Rules.Spellcasting.Formula",
    focus: "SODL.Rules.Spellcasting.Focus",
    useCost: "SODL.Rules.Spellcasting.UseCost",
    nonConsenting: "SODL.Rules.Spellcasting.NonConsenting",
    incantation: {
      description: "SODL.Rules.Spellcasting.Incantation.Description",
      cast: "SODL.Rules.Spellcasting.Incantation.Cast",
      powerVsLevel: "SODL.Rules.Spellcasting.Incantation.PowerVsLevel",
      higherPower: "SODL.Rules.Spellcasting.Incantation.HigherPower"
    },
    usesTable: {
      header: [
        "SODL.Rules.Spellcasting.UsesTable.Header.0",
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6+"
      ],
      rows: [
        [
          0,
          "1",
          "—",
          "—",
          "—",
          "—",
          "—",
          "—"
        ],
        [
          1,
          "2",
          "1",
          "—",
          "—",
          "—",
          "—",
          "—"
        ],
        [
          2,
          "3",
          "2",
          "1",
          "—",
          "—",
          "—",
          "—"
        ],
        [
          3,
          "4",
          "2",
          "1",
          "1",
          "—",
          "—",
          "—"
        ],
        [
          4,
          "5",
          "2",
          "2",
          "1",
          "1",
          "—",
          "—"
        ],
        [
          5,
          "6",
          "3",
          "2",
          "2",
          "1",
          "1",
          "—"
        ],
        [
          6,
          "7",
          "3",
          "2",
          "2",
          "2",
          "1",
          "1"
        ],
        [
          7,
          "8",
          "3",
          "2",
          "2",
          "2",
          "1",
          "1"
        ],
        [
          8,
          "9",
          "3",
          "3",
          "2",
          "2",
          "2",
          "1"
        ]
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

export function localizedConfig(t) {
  return localizeTree(SODL_CONFIG, t);
}

export default SODL_CONFIG;
