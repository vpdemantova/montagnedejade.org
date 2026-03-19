/**
 * Script: enrich-wikipedia.ts
 * Busca resumos e imagens da Wikipedia para todos os itens do Atlas
 * que estão sem coverImage ou com conteúdo curto.
 *
 * Run: npx tsx prisma/enrich-wikipedia.ts
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Map de títulos PT → termo de busca EN/PT para Wikipedia
const TITLE_OVERRIDES: Record<string, string> = {
  "Panthera leo":                    "Lion",
  "Águia Harpia":                    "Harpy eagle",
  "Octopus vulgaris":                "Octopus vulgaris",
  "Floresta Amazônica":              "Amazon rainforest",
  "Sequoia sempervirens":            "Sequoia sempervirens",
  "Recife de Coral":                 "Coral reef",
  "Mesopotâmia":                     "Mesopotamia",
  "Império Romano":                  "Roman Empire",
  "Civilização Maia":                "Maya civilization",
  "Via Láctea":                      "Milky Way",
  "Buracos Negros":                  "Black hole",
  "Nebulosa de Órion":               "Orion Nebula",
  "Teoria da Relatividade":          "Theory of relativity",
  "Mecânica Quântica":               "Quantum mechanics",
  "DNA — Estrutura Dupla Hélice":    "DNA",
  "Sinfonia nº 9 em Ré menor, Op. 125": "Symphony No. 9 (Beethoven)",
  "As Quatro Estações":              "The Four Seasons (Vivaldi)",
  "Mass in B minor":                 "Mass in B minor",
  "A Criação de Adão":               "The Creation of Adam",
  "A Noite Estrelada":               "The Starry Night",
  "Davi":                            "David (Michelangelo)",
  "Imprensa de Gutenberg":           "Printing press",
  "Máquina a Vapor":                 "Steam engine",
  "Internet":                        "Internet",
  "Renascimento":                    "Renaissance",
  "Revolução Francesa":              "French Revolution",
  "Segunda Guerra Mundial":          "World War II",
  "Monte Everest":                   "Mount Everest",
  "Rio Amazonas":                    "Amazon River",
  "Grandes Muralha da China":        "Great Wall of China",
  "Marie Curie":                     "Marie Curie",
  "Leonardo da Vinci":               "Leonardo da Vinci",
  "Johann Sebastian Bach":           "Johann Sebastian Bach",
  "Nikola Tesla":                    "Nikola Tesla",
  "Aristóteles":                     "Aristotle",
  "Ada Lovelace":                    "Ada Lovelace",
  "Dom Quixote":                     "Don Quixote",
  "A Divina Comédia":                "Divine Comedy",
  "Os Lusíadas":                     "Os Lusíadas",
  "Variações Goldberg, BWV 988":     "Goldberg Variations",
  "Sonata ao Luar, Op. 27 nº 2":     "Piano Sonata No. 14 (Beethoven)",
  "Le Sacre du Printemps":           "The Rite of Spring",
  "Coliseu de Roma":                 "Colosseum",
  "Taj Mahal":                       "Taj Mahal",
  "Pirâmides de Gizé":               "Great Pyramid of Giza",
  "Albert Einstein":                 "Albert Einstein",
  "Frida Kahlo":                     "Frida Kahlo",
  "William Shakespeare":             "William Shakespeare",
  "Isaac Newton":                    "Isaac Newton",
  "Immanuel Kant":                   "Immanuel Kant",
  "Simone de Beauvoir":              "Simone de Beauvoir",
  "Carnaval do Rio de Janeiro":      "Rio Carnival",
  "Flamenco":                        "Flamenco",
  "Kabuki":                          "Kabuki",
  "Jazz":                            "Jazz",
  "Cinema Novo Brasileiro":          "Cinema Novo",
  "Bauhaus":                         "Bauhaus",
  "Renascimento Harlem":             "Harlem Renaissance",
  "Machu Picchu":                    "Machu Picchu",
  "Partenon":                        "Parthenon",
  "Sagrada Família":                 "Sagrada Família",
  "Ópera de Sydney":                 "Sydney Opera House",
  "Catedral de Notre-Dame":          "Notre-Dame de Paris",
  "Angkor Wat":                      "Angkor Wat",
  "Estoicismo":                      "Stoicism",
  "Método Científico":               "Scientific method",
  "Iluminismo":                      "Age of Enlightenment",
  "Evolução por Seleção Natural":    "Natural selection",
  "Psicanálise":                     "Psychoanalysis",
  "Computação e Algoritmos":         "Algorithm",
  "2001: Uma Odisseia no Espaço":    "2001: A Space Odyssey (film)",
  "Migrant Mother":                  "Migrant Mother",
  "Cidadão Kane":                    "Citizen Kane",
  "Grande Sertão: Veredas":          "The Devil to Pay in the Backlands",
  "Cem Anos de Solidão":             "One Hundred Years of Solitude",
  "Hamlet":                          "Hamlet",
  "Crime e Castigo":                 "Crime and Punishment",
  "Elementos de Euclides":           "Euclid's Elements",
  "Cálculo Diferencial e Integral":  "Calculus",
  "Linguística Estrutural":          "Structural linguistics",
  "Mudanças Climáticas":             "Climate change",
  "Inteligência Artificial":         "Artificial intelligence",
  "Globalização":                    "Globalization",
  "Direitos Humanos":                "Human rights",
  "Democracia":                      "Democracy",
  "Deriva Continental":              "Continental drift",
  "Vulcão Vesúvio":                  "Mount Vesuvius",
  "Sistema Solar":                   "Solar System",
  "Pangeia":                         "Pangaea",
  "Vasco da Gama":                   "Vasco da Gama",
  "Cleópatra VII":                   "Cleopatra",
  "Nelson Mandela":                  "Nelson Mandela",
  "Teoria das Cores de Goethe":      "Theory of Colours",
  "Grid Sistema Tipográfico":        "Grid (graphic design)",
  "Design Thinking":                 "Design thinking",
  "Movimento Arts & Crafts":         "Arts and Crafts movement",
  "Os Guerrilheiros de Pernambuco":  "Cinema Novo",
}

interface WikiSummary {
  title:    string
  extract:  string
  thumbnail?: { source: string }
  content_urls?: { desktop?: { page?: string } }
}

async function fetchWikipedia(searchTerm: string): Promise<WikiSummary | null> {
  const encoded = encodeURIComponent(searchTerm.replace(/ /g, "_"))
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "PortalSolar/1.0 (educational project)" },
    })
    if (!res.ok) return null
    return await res.json() as WikiSummary
  } catch {
    return null
  }
}

async function main() {
  const items = await prisma.atlasItem.findMany()
  console.log(`\nEnriquecendo ${items.length} itens com dados da Wikipedia...\n`)

  let updated = 0
  let skipped = 0
  let failed  = 0

  for (const item of items) {
    const searchTerm = TITLE_OVERRIDES[item.title] ?? item.title

    // Skip if already has both image and long content
    const hasImage   = !!item.coverImage
    const hasContent = (item.content?.length ?? 0) > 200

    if (hasImage && hasContent) {
      console.log(`  ⏭  ${item.title}`)
      skipped++
      continue
    }

    const wiki = await fetchWikipedia(searchTerm)

    if (!wiki || !wiki.extract) {
      // Try Portuguese Wikipedia
      const ptUrl = `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(item.title.replace(/ /g, "_"))}`
      try {
        const ptRes = await fetch(ptUrl, { headers: { "User-Agent": "PortalSolar/1.0" } })
        if (ptRes.ok) {
          const ptWiki = await ptRes.json() as WikiSummary
          if (ptWiki.extract) {
            await prisma.atlasItem.update({
              where: { id: item.id },
              data: {
                content:    !hasContent ? ptWiki.extract : item.content,
                coverImage: !hasImage && ptWiki.thumbnail?.source ? ptWiki.thumbnail.source : item.coverImage,
              },
            })
            console.log(`  ✓ ${item.title} [pt]`)
            updated++
            continue
          }
        }
      } catch { /* ignore */ }

      console.log(`  ✗ ${item.title} — não encontrado`)
      failed++
      continue
    }

    const newContent    = !hasContent && wiki.extract ? wiki.extract : (item.content ?? "")
    const newCoverImage = !hasImage && wiki.thumbnail?.source ? wiki.thumbnail.source : (item.coverImage ?? "")

    await prisma.atlasItem.update({
      where: { id: item.id },
      data: {
        content:    newContent    || undefined,
        coverImage: newCoverImage || undefined,
      },
    })

    console.log(`  ✓ ${item.title}${newCoverImage && !hasImage ? " [+img]" : ""}`)
    updated++

    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 120))
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`✓ Atualizados: ${updated}`)
  console.log(`⏭  Já completos: ${skipped}`)
  console.log(`✗ Falhou: ${failed}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
