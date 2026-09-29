# Web — Find My Car Integration

Use the existing `Parking.Api` endpoints only. Do not use SQL directly, do not add connection strings, and do not move parking business logic into the web client.

Related backend docs:
- `docs/CLIENT-API.md`
- `docs/API-CONTRACT.md`
- `docs/SIGNALR-CONTRACT.md`

## Goal

Add `Find My Car` in the authenticated web client for the current user's own vehicles only.

Flow:

```text
My Vehicles
  ↓
Select Vehicle
  ↓
Find My Car
  ↓
GET current location
  ↓
Display details
  ↓
Show Location
```

## Scope Rules

- Keep the existing web authentication flow unchanged.
- Use `GET /api/v1/me/vehicles` for owned vehicles.
- Use the existing vehicle-location endpoint to resolve the selected plate.
- Never expose another user's vehicle location.
- Do not create SQL connections.
- Do not re-implement route generation or location resolution in JavaScript/TypeScript.
- If the platform has no 3D indoor viewer, render a 2D indoor map from the API route graph.

## Required REST Endpoints

### 1. My Vehicles

Use:

```http
GET /api/v1/me/vehicles
Authorization: Bearer {accessToken}
Accept-Language: ar
```

Take the selected `plate` from this list.

### 2. Find My Car

Use:

```http
GET /api/parking/vehicle-location/find?plate={plate}
Authorization: Bearer {accessToken}
Accept-Language: ar
```

Optional route-start parameters if the web app knows the current indoor start point:

```http
GET /api/parking/vehicle-location/find?plate={plate}&fromX={x}&fromY={y}&fromFloorId={floorId}
```

This endpoint already enforces the ownership/security rules server-side.

## What To Display

Display these response fields:

- `plate`
- `areaName` as `Building`
- `zoneName` as `Zone`
- `parkingLotName` as `Parking`
- `floorId` as `Floor`
- `laneName` as `Lane`
- `placeName` as `Place`
- `locationAccuracy` as `Location Accuracy`
- `capturedAt` as `Last Updated`
- `route.totalDistance` as `Distance`
- `route.estimatedTimeSeconds` as `Estimated Time`

Also use:

- `isCurrent`
- `message`
- `locationType`
- `latitude`, `longitude`
- `indoorX`, `indoorY`, `indoorZ`
- `route.nodes`
- `route.edges`
- `route.instructions`

## UI Behavior

### My Vehicles

Add a `Find My Car` button/action on each owned vehicle row/card.

### Result Panel / Modal / Page

Show:

- Plate
- Building
- Zone
- Parking
- Floor
- Lane
- Place
- Location Accuracy
- Last Updated
- Distance
- Estimated Time

Then show:

- `Show Location`

### Map Behavior

If an indoor 3D viewer exists in web:

- open the indoor navigation view
- switch to the correct building/floor
- highlight the destination
- draw the route from the API route nodes/edges
- show navigation instructions

If a 3D viewer is not available:

- render a 2D indoor map
- draw route segments from `route.nodes` and `route.edges`
- do not draw a fake straight line

## Important Empty/Fallback States

### No route

If `route` is missing:

- show `Route unavailable`
- keep showing textual location details if they exist
- do not generate your own route

### No place

If `placeId` / `placeName` is missing:

- show `zone` / `lane` only

### No coordinates

If the map coordinates are unavailable:

- show `Location unavailable`
- keep the text-based details visible

### Last known only

If `isCurrent = false`:

- label it as `Last known location`
- do not display it as an active current parking position

## Realtime

Connect to:

```http
/hubs/parking
```

Use the same JWT already used by the web app.

Handle these events:

### `VehicleLocationUpdated`

When received for the currently tracked plate:

- refresh the visible details card
- update the marker on the map
- if the user is in the location view, call the REST endpoint again to refresh the full payload
- do not rebuild the full UI state from the delta alone

### `VehicleLocationCleared`

When received for the tracked plate:

- mark the vehicle as no longer currently parked
- clear current-location visuals when appropriate
- show `Last known location` or `Vehicle exited`
- do not keep the old parking location as current

## Suggested Web Structure

Recommended insertion points:

1. `My Vehicles` page
2. per-vehicle `Find My Car` action
3. details page/modal/side panel
4. `Show Location` action
5. indoor map view

Use whatever component structure the web app already has. Keep the route/location logic on the backend.

## Response Handling Notes

- All API responses are wrapped; read `data`
- Dates are UTC and should be localized in the UI
- `estimatedTimeSeconds` should be formatted for display
- `locationAccuracy` may be:
  - `Exact`
  - `Approximate`
  - `ZoneOnly`
  - `Unknown`

## Example Developer Checklist

- Load owned vehicles from `/api/v1/me/vehicles`
- Add `Find My Car` action per vehicle
- Call `/api/parking/vehicle-location/find?plate=...`
- Render the location details
- Add `Show Location`
- Subscribe to SignalR:
  - `VehicleLocationUpdated`
  - `VehicleLocationCleared`
- Refresh the current tracked vehicle view in realtime
- Ensure only the current user's vehicles are visible

Implemented on `nri-web` (19 Aug 2026): `/find-car`, `/find-car/:plate`, profile action, 2D map from `route.nodes`/`route.edges`, hub events above. Endpoint used: `GET /api/parking/vehicle-location/find` (not `/api/v1/...`).

## Do Not Do

- Do not connect to SQL Server
- Do not calculate ownership in the web app
- Do not create guessed routes
- Do not show last known location as current
- Do not change login/refresh/auth behavior
