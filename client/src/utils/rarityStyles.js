export function getRarityStyle(code) {
  switch (code) {
    case '(C)':    return { bg: 'var(--bg-surface)',          color: 'var(--text-secondary)',     label: 'Common'        }
    case '(R)':    return { bg: 'var(--card-rare-bg)',        color: 'var(--card-rare-text)',     label: 'Rare'          }
    case '(SR)':   return { bg: 'var(--card-link-light)',     color: 'var(--card-link-text)',     label: 'Super'         }
    case '(UR)':   return { bg: 'var(--card-normal-light)',   color: 'var(--card-normal-text)',   label: 'Ultra'         }
    case '(ScR)':  return { bg: 'var(--card-trap-light)',     color: 'var(--card-trap-text)',     label: 'Secret'        }
    case '(StR)':  return { bg: 'var(--card-spell-light)',    color: 'var(--card-spell-text)',    label: 'Starlight'     }
    case '(GR)':   return { bg: 'var(--card-synchro-light)',  color: 'var(--card-synchro-text)',  label: 'Ghost'         }
    case '(PScR)': return { bg: 'var(--card-fusion-light)',   color: 'var(--card-fusion-text)',   label: 'Prismatic'     }
    case '(UtR)':  return { bg: 'var(--card-xyz-light)',      color: 'var(--card-xyz-text)',      label: 'Ultimate'      }
    case '(GUR)':  return { bg: 'var(--card-normal-light)',   color: 'var(--card-normal-text)',   label: 'Gold'          }
    case '(PG)':   return { bg: 'var(--card-normal-light)',   color: 'var(--card-normal-text)',   label: 'Gold'          }
    case '(PR)':   return { bg: 'var(--card-synchro-light)',  color: 'var(--card-synchro-text)',  label: 'Parallel'      }
    case '(SFR)':  return { bg: 'var(--card-spell-light)',    color: 'var(--card-spell-text)',    label: 'Starfoil'      }
    case '(SHR)':  return { bg: 'var(--card-spell-light)',    color: 'var(--card-spell-text)',    label: 'Shatterfoil'   }
    case '(PS)':   return { bg: 'var(--card-trap-light)',     color: 'var(--card-trap-text)',     label: 'Platinum'      }
    case '(DSPR)': return { bg: 'var(--card-link-light)',     color: 'var(--card-link-text)',     label: 'Duel Terminal' }
    case '(CR)':   return { bg: 'var(--card-trap-light)',     color: 'var(--card-trap-text)',     label: "Collector's"   }
    case '':       return { bg: 'var(--bg-surface)',          color: 'var(--text-secondary)',     label: 'Special'       }
    default:       return { bg: 'var(--bg-surface)',          color: 'var(--text-secondary)',     label: 'Special'       }
  }
}

export function getRarityRank(code) {
  const ranks = {
    '(C)':    1,
    '(R)':    2,
    '(SR)':   3,
    '(UR)':   4,
    '(ScR)':  5,
    '(StR)':  6,
    '(GR)':   7,
    '(PScR)': 8,
    '(UtR)':  9,
    '(CR)':   10,
    '(GUR)':  10,
  }
  return ranks[code] ?? 0
}
