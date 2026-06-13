import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  formatPrice,
  parseRoute,
  filterCars,
  sortCars,
  getCarById,
  getFeaturedCars,
  getUniqueValues
} from '../app.js';

const cars = [
  {
    id: 'a',
    brand: '丰田',
    type: '轿车',
    price: 128000,
    year: 2021,
    mileage: 3.8,
    fuel: '汽油',
    transmission: '自动',
    featured: true
  },
  {
    id: 'b',
    brand: '比亚迪',
    type: 'SUV',
    price: 96000,
    year: 2023,
    mileage: 1.2,
    fuel: '纯电',
    transmission: '自动',
    featured: false
  }
];

test('formatPrice renders RMB in 万元 units', () => {
  assert.equal(formatPrice(128000), '12.80万');
});

test('parseRoute returns default home route', () => {
  assert.deepEqual(parseRoute('https://example.com/index.html'), {
    page: 'home',
    id: ''
  });
});

test('parseRoute reads page and id query params', () => {
  assert.deepEqual(parseRoute('https://example.com/index.html?page=car&id=a'), {
    page: 'car',
    id: 'a'
  });
});

test('filterCars filters by brand, type, price, mileage, fuel, and transmission', () => {
  const result = filterCars(cars, {
    brand: '比亚迪',
    type: 'SUV',
    price: '5-10',
    mileage: '0-3',
    fuel: '纯电',
    transmission: '自动'
  });

  assert.deepEqual(result.map((car) => car.id), ['b']);
});

test('sortCars sorts by newest year without mutating input', () => {
  const result = sortCars(cars, 'year-desc');

  assert.deepEqual(result.map((car) => car.id), ['b', 'a']);
  assert.deepEqual(cars.map((car) => car.id), ['a', 'b']);
});

test('cars.json contains usable sample inventory', async () => {
  const raw = await readFile(new URL('../data/cars.json', import.meta.url), 'utf8');
  const inventory = JSON.parse(raw);

  assert.ok(inventory.length >= 6);
  for (const car of inventory) {
    assert.ok(car.id);
    assert.ok(car.name);
    assert.ok(car.coverImage);
    assert.ok(car.images.length >= 4);
    assert.ok(car.price > 0);
  }
});

test('getUniqueValues returns sorted unique values', () => {
  assert.deepEqual(getUniqueValues(cars, 'brand'), ['丰田', '比亚迪']);
});

test('getCarById returns matching car or null', () => {
  assert.equal(getCarById(cars, 'a').id, 'a');
  assert.equal(getCarById(cars, 'missing'), null);
});

test('getFeaturedCars returns featured cars with limit', () => {
  assert.deepEqual(getFeaturedCars(cars, 1).map((car) => car.id), ['a']);
});
