import { test, expect } from '@playwright/test'

test.describe('KONI Kab Malang Homepage', () => {
  test('should render hero section with main titles', async ({ page }) => {
    await page.goto('http://localhost:5173')
    
    // 1. Brand Identity (T1)
    await expect(page.getByText('Portal Resmi KONI Kabupaten Malang')).toBeVisible()
    await expect(page.getByText('Membangun Prestasi Olahraga Kabupaten Malang')).toBeVisible()
    
    // 2. Navigation & CTA (T4)
    const jelajahiCabor = page.getByRole('link', { name: 'Jelajahi Cabor' })
    await expect(jelajahiCabor).toBeVisible()
    await expect(jelajahiCabor).toHaveAttribute('href', '/cabor')
    
    // 3. CTA Buttons in Hero
    const detailEvent = page.getByRole('link', { name: 'Detail Event' })
    const lihatJadwal = page.getByRole('link', { name: 'Lihat Jadwal' })
    
    // Check if upcoming event section exists
    if (await detailEvent.count() > 0) {
      await expect(detailEvent).toBeVisible()
      await expect(lihatJadwal).toBeVisible()
      await expect(lihatJadwal).toHaveAttribute('href', /tab=tournament/)
    }
  })

  test('should display news section with metadata (T2)', async ({ page }) => {
    await page.goto('http://localhost:5173')
    
    await expect(page.getByText('Berita Terkini')).toBeVisible()
    
    // Wait for news to load
    const newsArticles = page.locator('article')
    const count = await newsArticles.count()
    
    if (count > 0) {
      // Check metadata views
      await expect(page.getByText('Dilihat')).first().toBeVisible()
      
      // Check hover effect trigger (visual test would be better, but we can check style)
      const firstArticle = newsArticles.first()
      await firstArticle.hover()
      
      // Check read more link
      const readMore = firstArticle.getByText('Baca Selengkapnya')
      await expect(readMore).toBeVisible()
    }
  })

  test('should display medal standings and ensure table responsiveness (T3)', async ({ page }) => {
    await page.goto('http://localhost:5173')
    
    // Check if medal standings section exists
    const medalTitle = page.getByText('Klasemen Medali')
    if (await medalTitle.count() > 0) {
      await expect(medalTitle).toBeVisible()
      
      // Check for horizontal scroll container (T3 Fix)
      const scrollContainer = page.locator('.card div[style*="overflow-x: auto"]')
      if (await scrollContainer.count() === 0) {
        // Fallback check if class/style is different
        const table = page.locator('table')
        const parent = page.locator('div:has(table)').first()
        const style = await parent.getAttribute('style')
        expect(style).toContain('overflow-x: auto')
      } else {
        await expect(scrollContainer).toBeVisible()
      }
    }
  })

  test('should have correct portal links in bottom section (T4)', async ({ page }) => {
    await page.goto('http://localhost:5173')
    
    await expect(page.getByText('Jelajahi Portal')).toBeVisible()
    
    const eventLink = page.locator('a[href="/event"]').filter({ hasText: 'Event' })
    await expect(eventLink).toBeVisible()
  })
})
