import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  formatPrice,
  parseRoute,
  sortCars,
  getCarById,
  getCarsForList,
  getGalleryImages,
  clampZoomScale
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

test('parseRoute returns vehicle list as the default route', () => {
  assert.deepEqual(parseRoute('https://example.com/index.html'), {
    page: 'cars',
    id: ''
  });
});

test('parseRoute reads page and id query params', () => {
  assert.deepEqual(parseRoute('https://example.com/index.html?page=car&id=a'), {
    page: 'car',
    id: 'a'
  });
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

test('getCarById returns matching car or null', () => {
  assert.equal(getCarById(cars, 'a').id, 'a');
  assert.equal(getCarById(cars, 'missing'), null);
});

test('getCarsForList ignores old search query params and returns all cars by newest order', () => {
  const result = getCarsForList(cars, 'https://example.com/index.html?page=cars&brand=比亚迪&price=5-10');

  assert.deepEqual(result.map((car) => car.id), ['a', 'b']);
});

test('getGalleryImages merges cover and detail images without duplicates', () => {
  const result = getGalleryImages({
    coverImage: 'cover.jpg',
    images: ['cover.jpg', 'side.jpg', 'interior.jpg', 'side.jpg']
  });

  assert.deepEqual(result, ['cover.jpg', 'side.jpg', 'interior.jpg']);
});

test('clampZoomScale keeps zoom scale within bounds', () => {
  assert.equal(clampZoomScale(0.4), 0.8);
  assert.equal(clampZoomScale(1.4), 1.4);
  assert.equal(clampZoomScale(3.1), 2.5);
});
