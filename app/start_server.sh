#!/bin/bash

npx prisma migrate dev --name frigo
npx prisma generate
npm run build

npm run start