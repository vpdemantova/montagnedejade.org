/**
 * Baixa as 16 pinturas de domínio público do Wikimedia Commons
 * para public/paintings/ — use: node scripts/download-paintings.mjs
 */

import { createWriteStream, existsSync, mkdirSync, statSync, unlinkSync } from "fs"
import { pipeline }                                  from "stream/promises"
import { get as httpsGet }                           from "https"
import { get as httpGet  }                           from "http"
import path                                          from "path"
import { fileURLToPath }                             from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DEST      = path.join(__dirname, "..", "public", "paintings")

if (!existsSync(DEST)) mkdirSync(DEST, { recursive: true })

const PAINTINGS = [
  { file: "starry-night.jpg",      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg" },
  { file: "mona-lisa.jpg",         url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/402px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg" },
  { file: "birth-of-venus.jpg",    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg/1024px-Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg" },
  { file: "the-scream.jpg",        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/800px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg" },
  { file: "girl-pearl-earring.jpg",url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/800px-1665_Girl_with_a_Pearl_Earring.jpg" },
  { file: "great-wave.jpg",        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tsunami_by_hokusai_19th_century.jpg/1200px-Tsunami_by_hokusai_19th_century.jpg" },
  { file: "water-lilies.jpg",      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/1280px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg" },
  { file: "night-watch.jpg",       url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/The_Night_Watch_-_HD.jpg/1280px-The_Night_Watch_-_HD.jpg" },
  { file: "last-supper.jpg",       url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Leonardo_da_Vinci_%281452-1519%29_-_The_Last_Supper_%281495-1498%29.jpg/1280px-Leonardo_da_Vinci_%281452-1519%29_-_The_Last_Supper_%281495-1498%29.jpg" },
  { file: "sunflowers.jpg",        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Vincent_van_Gogh_-_Sunflowers_-_VGM_F458.jpg/1024px-Vincent_van_Gogh_-_Sunflowers_-_VGM_F458.jpg" },
  { file: "klimt-kiss.jpg",        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg/1024px-The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg" },
  { file: "las-meninas.jpg",       url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Las_Meninas_01.jpg/800px-Las_Meninas_01.jpg" },
  { file: "school-of-athens.jpg",  url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg/1280px-%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg" },
  { file: "american-gothic.jpg",   url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Grant_DeVolson_Wood_-_American_Gothic.jpg/480px-Grant_DeVolson_Wood_-_American_Gothic.jpg" },
  { file: "liberty-leading.jpg",   url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Eug%C3%A8ne_Delacroix_-_La_libert%C3%A9_guidant_le_peuple.jpg/1024px-Eug%C3%A8ne_Delacroix_-_La_libert%C3%A9_guidant_le_peuple.jpg" },
  { file: "wanderer.jpg",          url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg/724px-Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg" },
]

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file   = createWriteStream(dest)
    const getter = url.startsWith("https") ? httpsGet : httpGet
    getter(url, { headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    }}, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close()
        download(res.headers.location, dest).then(resolve).catch(reject)
        return
      }
      if (res.statusCode !== 200) {
        file.close()
        reject(new Error(`HTTP ${res.statusCode} for ${url}`))
        return
      }
      pipeline(res, file).then(resolve).catch(reject)
    }).on("error", reject)
  })
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

let ok = 0; let fail = 0
for (const { file, url } of PAINTINGS) {
  const dest = path.join(DEST, file)
  if (existsSync(dest) && statSync(dest).size > 0) {
    console.log(`  ✓ já existe: ${file}`)
    ok++
    continue
  }
  if (existsSync(dest)) unlinkSync(dest)  // remove empty/corrupt file

  process.stdout.write(`  ↓ ${file} … `)
  let downloaded = false
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await download(url, dest)
      console.log("ok")
      ok++
      downloaded = true
      await sleep(8000)  // 8s between successful downloads to avoid 429
      break
    } catch (e) {
      if (existsSync(dest)) unlinkSync(dest)
      if (attempt < 3) {
        process.stdout.write(`(tentativa ${attempt} falhou, aguardando 15s…) `)
        await sleep(15000)
      } else {
        console.log(`ERRO: ${e.message}`)
        fail++
      }
    }
  }
  if (!downloaded && fail > 0) {
    await sleep(5000)
  }
}

console.log(`\n${ok} baixadas, ${fail} falhas — destino: public/paintings/`)
