# Database Setup Notes

## Current Configuration ✅

Your project is correctly configured with:

### Environment Variables
- **DATABASE_URL**: Points to Neon PostgreSQL database
- **NEXTAUTH_SECRET**: Configured for authentication
- Both `.env` (local) and `.env.production` use the **same database**

### What This Means
- ✅ Localhost and Vercel **share the same database**
- ✅ Any data changes in one environment appear in both
- ✅ No need for separate seeding on Vercel

## Updated Seed Script

The `prisma/seed.ts` has been updated with proper LADOOZI data:

### Categories (5)
1. **Dink Ladoo** - Traditional ladoos with edible gum for strength and stamina
2. **Besan Ladoo** - Classic gram flour ladoos for balanced energy
3. **Ravanaral Ladoo** - Light and aromatic semolina-based ladoos
4. **Special Ladoo** - Premium and festive varieties
5. **Healthy Ladoo** - Sugar-free and naturally sweetened options

### Products (9)
- Classic Dink Ladoo (₹550)
- Premium Dink Ladoo with Dry Fruits (₹750)
- Traditional Besan Ladoo (₹400)
- Kaju Besan Ladoo (₹500)
- Classic Ravanaral Ladoo (₹350)
- Motichoor Ladoo (₹450)
- Coconut Ladoo (₹380)
- Sugar-Free Dates Ladoo (₹600)
- Jaggery Til Ladoo (₹420)

### Sample Data
- 1 Welcome banner
- 1 Admin user (admin@example.com)

## Running the Seed Script

```bash
npm run seed
```

This will:
- Create/update all categories and products
- Ensure admin user exists
- Add sample banner
- Safe to run multiple times (uses `upsert`)

## Important Notes

1. **Shared Database**: Both localhost and Vercel use the same Neon database, so changes appear everywhere immediately
2. **Caching**: If you see differences between environments, it's likely browser caching:
   - Hard refresh: `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
   - Clear browser cache
3. **Images**: Products use placeholder images - replace with real product photos
4. **Admin Access**: Use admin@example.com / Admin@12345 to manage products

## Next Steps

1. **Replace Placeholder Images**
   - Upload real product photos
   - Update via admin panel at `/admin/products`

2. **Add More Products**
   - Use the admin panel to add additional varieties
   - Or update the seed script and re-run

3. **Verify Data**
   - Check products: `/products`
   - Check categories: `/products?category=dink-ladoo`
   - Admin panel: `/admin`

## Troubleshooting

If pages look different between localhost and Vercel:
1. Hard refresh both browsers
2. Clear browser cache
3. Check browser console for errors
4. Verify both are using the same DATABASE_URL in Vercel settings
