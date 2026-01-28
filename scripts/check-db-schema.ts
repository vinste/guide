#!/usr/bin/env tsx

/**
 * Script de diagnostic pour vérifier le schéma de la base de données
 * Utilisation : npm run check-db
 */

import 'dotenv/config';
import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function checkDatabaseSchema() {
  console.log('\n🔍 Vérification du schéma de base de données...\n');
  
  try {
    // Vérifier si les tables existent
    console.log('➡️  Vérification des tables...');
    
    const tablesQuery = sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    const tablesResult = await db.execute(tablesQuery);
    const tables = tablesResult.rows.map((row: any) => row.table_name);
    
    console.log(`\n✅ Tables trouvées (${tables.length}) :`);
    tables.forEach((table: string) => console.log(`   - ${table}`));
    
    // Vérifier la table analytics_pageviews
    if (tables.includes('analytics_pageviews')) {
      console.log('\n➡️  Structure de analytics_pageviews :');
      
      const columnsQuery = sql`
        SELECT 
          column_name, 
          data_type, 
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_name = 'analytics_pageviews'
        ORDER BY ordinal_position
      `;
      
      const columnsResult = await db.execute(columnsQuery);
      const columns = columnsResult.rows;
      
      console.log('\n   Colonnes :');
      columns.forEach((col: any) => {
        const nullable = col.is_nullable === 'YES' ? 'nullable' : 'not null';
        const maxLength = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
        console.log(`   - ${col.column_name}: ${col.data_type}${maxLength} ${nullable}`);
      });
      
      // Vérifier spécifiquement la colonne country
      const hasCountry = columns.some((col: any) => col.column_name === 'country');
      
      if (hasCountry) {
        console.log('\n✅ La colonne "country" existe !');
        
        // Compter les entrées avec un pays
        const countQuery = sql`
          SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN country IS NOT NULL THEN 1 END) as with_country,
            COUNT(CASE WHEN country IS NULL THEN 1 END) as without_country
          FROM analytics_pageviews
        `;
        
        const countResult = await db.execute(countQuery);
        const counts = countResult.rows[0] as any;
        
        console.log(`\n📊 Statistiques des données :`);
        console.log(`   Total de pages vues : ${counts.total}`);
        console.log(`   Avec pays : ${counts.with_country}`);
        console.log(`   Sans pays : ${counts.without_country}`);
        
        if (counts.with_country > 0) {
          // Lister les pays uniques
          const countriesQuery = sql`
            SELECT country, COUNT(*) as count
            FROM analytics_pageviews
            WHERE country IS NOT NULL
            GROUP BY country
            ORDER BY count DESC
          `;
          
          const countriesResult = await db.execute(countriesQuery);
          const countries = countriesResult.rows;
          
          console.log(`\n🌍 Pays détectés :`);
          countries.forEach((c: any) => {
            console.log(`   ${c.country}: ${c.count} page(s) vue(s)`);
          });
        } else {
          console.log('\n⚠️  Aucune donnée avec pays détecté.');
          console.log('   Raisons possibles :');
          console.log('   - Aucun visiteur n\'a encore visité le site depuis l\'ajout de la colonne');
          console.log('   - Les visiteurs viennent d\'IPs locales (localhost, 192.168.x.x)');
          console.log('   - La fonction detectCountry() retourne null pour toutes les IPs');
        }
      } else {
        console.log('\n❌ La colonne "country" n\'existe PAS !');
        console.log('\n🛠️  Solution : Exécuter la migration');
        console.log('   npm run db:push');
        console.log('\n   Ou manuellement avec psql :');
        console.log('   ALTER TABLE analytics_pageviews ADD COLUMN country VARCHAR(2);');
      }
    } else {
      console.log('\n❌ La table analytics_pageviews n\'existe pas !');
      console.log('\n🛠️  Solution : Créer les tables');
      console.log('   npm run db:push');
    }
    
    // Vérifier la configuration geoip-lite
    console.log('\n➡️  Vérification de geoip-lite...');
    
    try {
      const geoip = await import('geoip-lite');
      
      // Tester avec une IP publique connue (Google DNS)
      const testIP = '8.8.8.8';
      const geoResult = geoip.default.lookup(testIP);
      
      if (geoResult) {
        console.log(`\n✅ geoip-lite fonctionne correctement`);
        console.log(`   Test avec IP ${testIP} :`);
        console.log(`   - Pays : ${geoResult.country}`);
        console.log(`   - Région : ${geoResult.region}`);
        console.log(`   - Ville : ${geoResult.city || 'Non disponible'}`);
      } else {
        console.log(`\n⚠️  geoip-lite installé mais ne retourne pas de résultat`);
      }
    } catch (error) {
      console.log(`\n❌ Erreur lors du test de geoip-lite :`);
      console.log(`   ${error}`);
      console.log('\n🛠️  Solution : Installer geoip-lite');
      console.log('   npm install geoip-lite @types/geoip-lite');
    }
    
    console.log('\n✅ Vérification terminée !\n');
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la vérification :', error);
    console.error('\nAssurez-vous que :');
    console.error('1. La variable DATABASE_URL est définie dans .env');
    console.error('2. La base de données est accessible');
    console.error('3. Les permissions sont correctes');
    process.exit(1);
  }
  
  process.exit(0);
}

checkDatabaseSchema();
