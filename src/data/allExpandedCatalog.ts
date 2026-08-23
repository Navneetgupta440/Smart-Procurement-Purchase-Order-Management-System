import { Product, ProductCategory, Supplier } from '../types/procurement';
import { EXPANDED_PRODUCTS_PART1 } from './expandedProductsPart1';
import { EXPANDED_PRODUCTS_PART2 } from './expandedProductsPart2';
import { EXPANDED_PRODUCTS_PART3 } from './expandedProductsPart3';
import { EXPANDED_PRODUCTS_PART4 } from './expandedProductsPart4';
import { EXPANDED_PRODUCTS_PART5 } from './expandedProductsPart5';
import { EXPANDED_PRODUCTS_PART6 } from './expandedProductsPart6';
import { EXPANDED_PRODUCTS_PART7 } from './expandedProductsPart7';
import { EXPANDED_PRODUCTS_PART8 } from './expandedProductsPart8';

// Expanded Categories including Amazon / Flipkart grocery and mobile categories
export const ADDITIONAL_CATEGORIES: ProductCategory[] = [
  {
    id: 'cat-13',
    name: 'Gourmet Foods & Pantry',
    description: 'Single-origin espresso beans, ceremonial matcha, Himalayan cold-pressed oils, and gourmet pantry essentials',
    code: 'FOOD'
  },
  {
    id: 'cat-14',
    name: 'Smartphones & Mobile Devices',
    description: 'Flagship enterprise smartphones, OLED tablets, smartwatches, and wireless spatial audio systems',
    code: 'MOBL'
  }
];

// Expanded Suppliers including Grocery & Gourmet Food specialists
export const ADDITIONAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-11',
    supplierCode: 'SUP-ORG-11',
    companyName: 'Organic Harvest & Gourmet Food Supplies Ltd',
    contactPerson: 'Aditi Sengupta',
    email: 'b2b.orders@organicharvestfoods.com',
    phone: '+91 80 4455 6677',
    address: 'Indiranagar 100 Feet Road, HAL 2nd Stage',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    gstNumber: '29LLLLL1111L1Z1',
    rating: 4.88,
    qualityScore: 98,
    deliveryScore: 96,
    reliabilityScore: 97,
    priceScore: 92,
    averageLeadDays: 2,
    status: 'ACTIVE',
    createdAt: '2026-03-01T00:00:00Z'
  }
];

// Aggregated All Expanded Products list (120+ new products)
export const ALL_EXPANDED_PRODUCTS: Product[] = [
  ...EXPANDED_PRODUCTS_PART1,
  ...EXPANDED_PRODUCTS_PART2,
  ...EXPANDED_PRODUCTS_PART3,
  ...EXPANDED_PRODUCTS_PART4,
  ...EXPANDED_PRODUCTS_PART5,
  ...EXPANDED_PRODUCTS_PART6,
  ...EXPANDED_PRODUCTS_PART7,
  ...EXPANDED_PRODUCTS_PART8
];
