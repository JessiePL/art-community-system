# Kimetsu Art Community System

A rebuilt MVP for a Demon Slayer inspired art community platform.

## Current Focus

This repository now centers on a web-first front-end MVP that matches the architecture brief:

- Home
- Characters
- Creator
- Merch
- Membership
- Events
- Profile

The current front end lives in [`/home/pan/Documents/Jessie's DailyStudy/art-community-system/frontend`](/home/pan/Documents/Jessie's DailyStudy/art-community-system/frontend) and is built with React + TypeScript + Vite.

## Business Rules Represented In The MVP

- Guests can browse public pages.
- Logged-in users can join events.
- Only members can place merchandise orders.
- Member returns are friendlier than regular-user returns.

## Backend Direction

The architecture brief targets ASP.NET Core Web API + MySQL + MongoDB.

The old `backend-node` folder is no longer the target implementation for the final system. It should be treated as temporary legacy experimentation while the real backend is rebuilt around the documented API contract.

See [`/home/pan/Documents/Jessie's DailyStudy/art-community-system/backend-api-contract.md`](/home/pan/Documents/Jessie's DailyStudy/art-community-system/backend-api-contract.md) for the next backend phase.
