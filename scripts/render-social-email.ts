import { writeFileSync } from 'fs'
import { getSocialPromoEmailHTML } from '../src/lib/email'

const html = getSocialPromoEmailHTML('MobileGameHunt Friend')
const targetPath = 'social-promo-preview.html'
writeFileSync(targetPath, html)
console.log(`Social promo email preview written to ${targetPath}`)

