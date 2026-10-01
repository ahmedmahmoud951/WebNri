import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,

  ToggleButton,
  ToggleButtonGroup,
  Typography,
  alpha,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AsyncBody } from '../../app/AsyncBody';
import { PageHeader } from '../../app/PageHeader';
import { Glyphs, IconTile } from '../../app/icons';
import { brand, glassPanel, glowPanel } from '../../app/theme';
import { useAuth } from '../../core/auth/authContext';
import { ApiError } from '../../core/api/errors';
import { displaySiteName } from '../../core/display';
import { queryKeys, useBuildings } from '../../core/api/hooks';
import { isValidLat, isValidLng, orderLatLng, parseCoord, parseLatLngPaste } from '../../core/geo/coords';

type DialogKind = 'site' | 'building' | 'zone' | 'parking' | 'place' | null;
type SourceMode = 'existing' | 'new';

const emptyWizard = {
  buildingMode: 'existing' as SourceMode,
  buildingId: 0,
  buildingName: '',
  zoneMode: 'existing' as SourceMode,
  zoneId: 0,
  zoneName: '',
  parkingName: '',
  parkingLat: '',
  parkingLng: '',
  placePrefix: 'P-',
  placeCount: 6,
};

function validLatLng(latText: string, lngText: string): { latitude: number; longitude: number } | null {
  const pasted = latText.includes(',') || latText.includes('@') ? parseLatLngPaste(latText) : null;
  if (pasted) return pasted;
  const latitude = parseCoord(latText);
  const longitude = parseCoord(lngText);
  if (latitude == null || longitude == null) return null;
  if (!isValidLat(latitude) || !isValidLng(longitude)) return null;
  return orderLatLng(latitude, longitude);
}

export function FreePlacesPage() {
  const { t } = useTranslation();
  const { api, user } = useAuth();
  const qc = useQueryClient();
  const canManage = user?.role === 'admin';
  const userBuildingId = user?.buildingId ?? undefined;

  const buildingsQ = useBuildings();
  const zonesQ = useQuery({
    queryKey: ['ops-zones'],
    queryFn: () => api.listZones(),
    enabled: canManage,
  });
  const parkingsQ = useQuery({
    queryKey: ['ops-parkings'],
    queryFn: () => api.listParkings(),
    enabled: canManage,
  });

  const [buildingId, setBuildingId] = useState<number | null>(null);
  const [zoneId, setZoneId] = useState<number | null>(null);
  const [parkingId, setParkingId] = useState<number | null>(null);

  const buildings = buildingsQ.data ?? [];
  const zones = useMemo(
    () => (zonesQ.data ?? []).filter((zone) => (buildingId == null ? true : zone.areaId === buildingId)),
    [zonesQ.data, buildingId],
  );
  const parkings = useMemo(
    () => (parkingsQ.data ?? []).filter((lot) => (zoneId == null ? true : lot.zoneId === zoneId)),
    [parkingsQ.data, zoneId],
  );

  useEffect(() => {
    if (buildingId != null || buildings.length === 0) return;
    const preferred = buildings.find((item) => item.id === userBuildingId) ?? buildings[0];
    if (preferred) setBuildingId(preferred.id);
  }, [buildingId, buildings, userBuildingId]);

  useEffect(() => {
    if (buildingId == null) {
      setZoneId(null);
      return;
    }
    if (zoneId != null && zones.some((zone) => zone.id === zoneId)) return;
    setZoneId(zones[0]?.id ?? null);
  }, [buildingId, zoneId, zones]);

  useEffect(() => {
    if (zoneId == null) {
      setParkingId(null);
      return;
    }
    if (parkingId != null && parkings.some((lot) => lot.id === parkingId)) return;
    setParkingId(parkings[0]?.id ?? null);
  }, [zoneId, parkingId, parkings]);

  const placesQ = useQuery({
    queryKey: ['ops-places', parkingId],
    queryFn: () => api.listPlaces(parkingId!),
    enabled: canManage && parkingId != null,
    refetchInterval: 4000,
  });

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [wizard, setWizard] = useState(emptyWizard);
  const [simpleName, setSimpleName] = useState('');
  const [simpleLat, setSimpleLat] = useState('');
  const [simpleLng, setSimpleLng] = useState('');
  const [editItem, setEditItem] = useState<{
    kind: 'building' | 'zone' | 'parking' | 'place';
    id: number;
    name: string;
    lat?: string;
    lng?: string;
    extraId?: number;
  } | null>(null);
  const [deleteItem, setDeleteItem] = useState<{
    kind: 'building' | 'zone' | 'parking' | 'place';
    id: number;
    name: string;
  } | null>(null);
  const [lastAttemptedDelete, setLastAttemptedDelete] = useState<{
    kind: 'building' | 'zone' | 'parking' | 'place';
    id: number;
    name: string;
  } | null>(null);
  const [dependencyModal, setDependencyModal] = useState<{
    kind: 'building' | 'zone' | 'parking' | 'place';
    id: number;
    name: string;
  } | null>(null);

  const occupied = useMemo(() => (placesQ.data ?? []).filter((place) => !place.isEmpty), [placesQ.data]);
  const free = useMemo(() => (placesQ.data ?? []).filter((place) => place.isEmpty), [placesQ.data]);

  const fail = (err: unknown) => {
    let msg = '';
    let isFkOrInUse = false;
    if (err instanceof ApiError) {
      const base = err.message || t('common.error');
      msg = err.correlationId ? `${base} (${err.correlationId})` : base;
      if (
        err.code === 'place_in_use' ||
        err.statusCode === 409 ||
        err.message?.includes('مرتبط') ||

        err.message?.includes('جلسة') ||
        err.message?.includes('مسار') ||
        err.message?.includes('كاميرا')
      ) {
        isFkOrInUse = true;
      }
    } else if (err instanceof Error && err.message) {
      msg = err.message;
      if (
        err.message.includes('مرتبط') ||
        err.message.includes('جلسة') ||
        err.message.includes('مسار') ||
        err.message.includes('كاميرا')
      ) {
        isFkOrInUse = true;
      }
    } else {
      msg = t('common.error');
    }
    setError(msg);
    if (isFkOrInUse && lastAttemptedDelete) {
      setDependencyModal(lastAttemptedDelete);
    }
  };

  const invalidateLive = () => {
    void qc.invalidateQueries({ queryKey: ['ops-places'] });
    void qc.invalidateQueries({ queryKey: ['ops-parkings'] });
    void qc.invalidateQueries({ queryKey: ['ops-zones'] });
    void qc.invalidateQueries({ queryKey: queryKeys.buildings });
    void qc.invalidateQueries({ queryKey: queryKeys.occupancyDetailsAll });
    if (userBuildingId) {
      void qc.invalidateQueries({ queryKey: queryKeys.occupancy(userBuildingId) });
      void qc.invalidateQueries({ queryKey: queryKeys.occupancyDetails(userBuildingId) });
    }
  };

  const openWizard = (kind: DialogKind) => {
    setError(null);
    setSimpleName('');
    setSimpleLat('');
    setSimpleLng('');
    setWizard({
      ...emptyWizard,
      buildingMode: buildingId ? 'existing' : 'new',
      buildingId: buildingId ?? 0,
      zoneMode: zoneId ? 'existing' : 'new',
      zoneId: zoneId ?? 0,
      parkingName: '',
    });
    setDialog(kind);
  };

  const setOccupancy = useMutation({
    mutationFn: ({ placeId, isEmpty }: { placeId: number; isEmpty: boolean }) =>
      api.setPlaceOccupancy(placeId, isEmpty),
    onMutate: ({ placeId }) => setBusyId(placeId),
    onSuccess: (_d, vars) => {
      setMessage(vars.isEmpty ? t('freePlaces.freedOne') : t('freePlaces.occupiedOne'));
      setError(null);
      invalidateLive();
    },
    onError: fail,
    onSettled: () => setBusyId(null),
  });

  const freeAll = useMutation({
    mutationFn: async () => {
      for (const place of occupied) {
        await api.setPlaceOccupancy(place.id, true);
      }
    },
    onSuccess: () => {
      setMessage(t('freePlaces.freedAll', { count: occupied.length }));
      setError(null);
      invalidateLive();
    },
    onError: fail,
  });

  const createBuilding = useMutation({
    mutationFn: () => api.createArea({ name: simpleName.trim(), isActive: true }),
    onSuccess: (created) => {
      setDialog(null);
      setBuildingId(created.id);
      setMessage(t('freePlaces.createdBuilding'));
      setError(null);
      invalidateLive();
    },
    onError: fail,
  });

  const createZone = useMutation({
    mutationFn: () => {
      if (buildingId == null) throw new Error(t('freePlaces.needBuilding'));
      return api.createZone({ name: simpleName.trim(), areaId: buildingId, isActive: true });
    },
    onSuccess: (created) => {
      setDialog(null);
      setZoneId(created.id);
      setMessage(t('freePlaces.createdZone'));
      setError(null);
      invalidateLive();
    },
    onError: fail,
  });

  const createParking = useMutation({
    mutationFn: () => {
      if (zoneId == null) throw new Error(t('freePlaces.needZone'));
      const coords = validLatLng(simpleLat, simpleLng);
      if (!coords) throw new Error(t('freePlaces.needCoords'));
      return api.createParking({
        name: simpleName.trim(),
        zoneId,
        isActive: true,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    },
    onSuccess: (created) => {
      setDialog(null);
      setParkingId(created.id);
      setMessage(t('freePlaces.createdParking'));
      setError(null);
      invalidateLive();
    },
    onError: fail,
  });

  const createPlace = useMutation({
    mutationFn: () => {
      if (parkingId == null) throw new Error(t('freePlaces.needParking'));
      const coords = validLatLng(simpleLat, simpleLng);
      return api.createPlace({
        name: simpleName.trim(),
        parkingId,
        isEmpty: true,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
      });
    },
    onSuccess: () => {
      setDialog(null);
      setSimpleName('');
      setMessage(t('freePlaces.createdOne'));
      setError(null);
      invalidateLive();
    },
    onError: fail,
  });

  const createSite = useMutation({
    mutationFn: async () => {
      let nextBuildingId = wizard.buildingMode === 'existing' ? wizard.buildingId : 0;
      if (wizard.buildingMode === 'new') {
        const name = wizard.buildingName.trim();
        if (!name) throw new Error(t('freePlaces.needBuilding'));
        const created = await api.createArea({ name, isActive: true });
        nextBuildingId = created.id;
      }
      if (nextBuildingId <= 0) throw new Error(t('freePlaces.needBuilding'));

      let nextZoneId = wizard.zoneMode === 'existing' ? wizard.zoneId : 0;
      if (wizard.zoneMode === 'new' || nextZoneId <= 0) {
        const name = wizard.zoneName.trim() || t('freePlaces.defaultZone');
        const created = await api.createZone({ name, areaId: nextBuildingId, isActive: true });
        nextZoneId = created.id;
      }
      if (nextZoneId <= 0) throw new Error(t('freePlaces.needZone'));

      const parkingName = wizard.parkingName.trim();
      if (!parkingName) throw new Error(t('freePlaces.needParking'));
      const coords = validLatLng(wizard.parkingLat, wizard.parkingLng);
      if (!coords) throw new Error(t('freePlaces.needCoords'));
      const parking = await api.createParking({
        name: parkingName,
        zoneId: nextZoneId,
        isActive: true,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      const count = Math.min(50, Math.max(0, Math.round(wizard.placeCount)));
      const prefix = wizard.placePrefix.trim() || 'P-';
      for (let index = 1; index <= count; index += 1) {
        await api.createPlace({
          name: `${prefix}${String(index).padStart(2, '0')}`,
          parkingId: parking.id,
          isEmpty: true,
        });
      }
      return { buildingId: nextBuildingId, zoneId: nextZoneId, parkingId: parking.id };
    },
    onSuccess: (created) => {
      setDialog(null);
      setBuildingId(created.buildingId);
      setZoneId(created.zoneId);
      setParkingId(created.parkingId);
      setMessage(t('freePlaces.createdSite'));
      setError(null);
      invalidateLive();
    },
    onError: fail,
  });

  const updateBuilding = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => api.updateArea(id, { name }),
    onSuccess: () => {
      setEditItem(null);
      setMessage(t('freePlaces.updatedBuilding'));
      setError(null);
      invalidateLive();
    },
    onError: fail,
  });

  const deleteBuilding = useMutation({
    mutationFn: (id: number) => api.deleteArea(id),
    onMutate: (id) => {
      setDeleteItem(null);
      qc.setQueryData(queryKeys.buildings, (old: any) =>
        Array.isArray(old) ? old.filter((b) => b.id !== id) : old,
      );
    },
    onSuccess: (_data, id) => {
      setDeleteItem(null);
      if (buildingId === id) setBuildingId(null);
      setZoneId(null);
      setParkingId(null);
      setMessage(t('freePlaces.deletedBuilding'));
      setError(null);
      invalidateLive();
    },
    onError: fail,
  });

  const updateZone = useMutation({
    mutationFn: ({ id, name, areaId }: { id: number; name: string; areaId: number }) =>
      api.updateZone(id, { name, areaId }),
    onSuccess: () => {
      setEditItem(null);
      setMessage(t('freePlaces.updatedZone'));
      setError(null);
      invalidateLive();
    },
    onError: fail,
  });

  const deleteZone = useMutation({
    mutationFn: (id: number) => api.deleteZone(id),
    onMutate: (id) => {
      setDeleteItem(null);
      qc.setQueryData(['ops-zones'], (old: any) =>
        Array.isArray(old) ? old.filter((z) => z.id !== id) : old,
      );
    },
    onSuccess: (_data, id) => {
      setDeleteItem(null);
      if (zoneId === id) setZoneId(null);
      setParkingId(null);
      setMessage(t('freePlaces.deletedZone'));
      setError(null);
      invalidateLive();
    },
    onError: fail,
  });

  const updateParking = useMutation({
    mutationFn: ({
      id,
      name,
      zoneId: lotZoneId,
      lat,
      lng,
    }: {
      id: number;
      name: string;
      zoneId: number;
      lat?: string;
      lng?: string;
    }) => {
      const coords = lat && lng ? validLatLng(lat, lng) : null;
      return api.updateParking(id, {
        name,
        zoneId: lotZoneId,
        isActive: true,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
      });
    },
    onSuccess: () => {
      setEditItem(null);
      setMessage(t('freePlaces.updatedParking'));
      setError(null);
      invalidateLive();
    },
    onError: fail,
  });

  const deleteParking = useMutation({
    mutationFn: (id: number) => api.deleteParking(id),
    onMutate: (id) => {
      setDeleteItem(null);
      qc.setQueryData(['ops-parkings'], (old: any) =>
        Array.isArray(old) ? old.filter((p) => p.id !== id) : old,
      );
    },
    onSuccess: (_data, id) => {
      setDeleteItem(null);
      if (parkingId === id) setParkingId(null);
      setMessage(t('freePlaces.deletedParking'));
      setError(null);
      invalidateLive();
    },
    onError: fail,
  });

  const updatePlace = useMutation({
    mutationFn: ({
      id,
      name,
      parkingId: placeParkingId,
      lat,
      lng,
    }: {
      id: number;
      name: string;
      parkingId: number;
      lat?: string;
      lng?: string;
    }) => {
      const coords = lat && lng ? validLatLng(lat, lng) : null;
      return api.updatePlace(id, {
        name,
        parkingId: placeParkingId,
        isEmpty: true,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
      });
    },
    onSuccess: () => {
      setEditItem(null);
      setMessage(t('freePlaces.updatedPlace'));
      setError(null);
      invalidateLive();
    },
    onError: fail,
  });

  const deletePlace = useMutation({
    mutationFn: (placeId: number) => api.deletePlace(placeId),
    onMutate: (placeId) => {
      setBusyId(placeId);
      setDeleteItem(null);
      qc.setQueryData(['ops-places', parkingId], (old: any) =>
        Array.isArray(old) ? old.filter((p) => p.id !== placeId) : old,
      );
    },
    onSuccess: () => {
      setDeleteItem(null);
      setMessage(t('freePlaces.deletedOne'));
      setError(null);
      invalidateLive();
    },
    onError: fail,
    onSettled: () => setBusyId(null),
  });

  const pending =
    createSite.isPending ||
    createBuilding.isPending ||
    createZone.isPending ||
    createParking.isPending ||
    createPlace.isPending ||
    updateBuilding.isPending ||
    deleteBuilding.isPending ||
    updateZone.isPending ||
    deleteZone.isPending ||
    updateParking.isPending ||
    deleteParking.isPending ||
    updatePlace.isPending ||
    deletePlace.isPending;

  if (!canManage) {
    return (
      <Stack spacing={2}>
        <PageHeader title={t('freePlaces.title')} hint={t('freePlaces.forbidden')} />
        <Alert severity="warning">{t('freePlaces.forbidden')}</Alert>
      </Stack>
    );
  }

  const selectedBuilding = buildings.find((item) => item.id === buildingId);
  const selectedZone = zones.find((item) => item.id === zoneId);
  const selectedParking = parkings.find((item) => item.id === parkingId);

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow={t('nav.groupOps')}
        title={t('freePlaces.title')}
        hint={t('freePlaces.hint')}
        actions={
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button variant="contained" onClick={() => openWizard('site')}>
              {t('freePlaces.wizard')}
            </Button>
            <Button component={RouterLink} to="/occupancy" variant="outlined">
              {t('freePlaces.openOccupancy')}
            </Button>
          </Stack>
        }
      />

      <Alert severity="info" sx={{ ...glassPanel() }}>
        {t('freePlaces.how')}
      </Alert>

      {message && (
        <Alert severity="success" onClose={() => setMessage(null)}>
          {message}
        </Alert>
      )}
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
        }}
      >
        {[
          { label: t('freePlaces.buildings'), value: buildings.length, tone: brand.violet },
          { label: t('freePlaces.zones'), value: zones.length, tone: brand.amber },
          { label: t('freePlaces.parkings'), value: parkingsQ.data?.length ?? 0, tone: brand.teal },
          { label: t('freePlaces.total'), value: placesQ.data?.length ?? 0, tone: brand.coral },
        ].map((metric) => (
          <Box
            key={metric.label}
            sx={{
              ...glowPanel(metric.tone),
              p: 2,
              boxShadow: `0 0 0 1px ${alpha(metric.tone, 0.35)}, 0 0 28px ${alpha(metric.tone, 0.18)}, 0 20px 40px ${alpha('#000', 0.4)}`,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {metric.label}
            </Typography>
            <Typography variant="h4" sx={{ color: metric.tone }}>
              {metric.value}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(4, minmax(0, 1fr))' },
        }}
      >
        <HierarchyColumn
          step="1"
          title={t('freePlaces.stepBuilding')}
          empty={t('freePlaces.noBuildings')}
          tone="violet"
          addLabel={t('freePlaces.addBuilding')}
          onAdd={() => openWizard('building')}
          selectedName={selectedBuilding ? (displaySiteName(selectedBuilding.name) || selectedBuilding.name) : undefined}
          onEditSelected={selectedBuilding ? () => setEditItem({ kind: 'building', id: selectedBuilding.id, name: selectedBuilding.name }) : undefined}
          onDeleteSelected={selectedBuilding ? () => setDeleteItem({ kind: 'building', id: selectedBuilding.id, name: selectedBuilding.name }) : undefined}
          icon={Glyphs.home}
        >
          {buildings.map((item) => (
            <SelectCard
              key={item.id}
              selected={item.id === buildingId}
              title={displaySiteName(item.name) || item.name}
              meta={t('freePlaces.placeMeta', { free: item.emptyPlaces, total: item.totalPlaces })}
              onClick={() => {
                setBuildingId(item.id);
                setZoneId(null);
                setParkingId(null);
              }}
              onEdit={() =>
                setEditItem({
                  kind: 'building',
                  id: item.id,
                  name: item.name,
                })
              }
              onDelete={() =>
                setDeleteItem({
                  kind: 'building',
                  id: item.id,
                  name: item.name,
                })
              }
            />
          ))}
        </HierarchyColumn>

        <HierarchyColumn
          step="2"
          title={t('freePlaces.stepZone')}
          empty={t('freePlaces.noZones')}
          tone="gold"
          addLabel={t('freePlaces.addZone')}
          onAdd={() => openWizard('zone')}
          addDisabled={buildingId == null}
          selectedName={selectedZone ? (displaySiteName(selectedZone.name) || selectedZone.name) : undefined}
          onEditSelected={selectedZone ? () => setEditItem({ kind: 'zone', id: selectedZone.id, name: selectedZone.name, extraId: selectedZone.areaId ?? buildingId ?? 1 }) : undefined}
          onDeleteSelected={selectedZone ? () => setDeleteItem({ kind: 'zone', id: selectedZone.id, name: selectedZone.name }) : undefined}
          icon={Glyphs.grid}
        >
          {zones.map((item) => (
            <SelectCard
              key={item.id}
              selected={item.id === zoneId}
              title={displaySiteName(item.name) || item.name}
              meta={t('freePlaces.parkingMeta', { count: item.parkingCount ?? 0 })}
              onClick={() => {
                setZoneId(item.id);
                setParkingId(null);
              }}
              onEdit={() =>
                setEditItem({
                  kind: 'zone',
                  id: item.id,
                  name: item.name,
                  extraId: item.areaId ?? buildingId ?? 1,
                })
              }
              onDelete={() =>
                setDeleteItem({
                  kind: 'zone',
                  id: item.id,
                  name: item.name,
                })
              }
            />
          ))}
        </HierarchyColumn>

        <HierarchyColumn
          step="3"
          title={t('freePlaces.stepParking')}
          empty={t('freePlaces.noParkings')}
          tone="teal"
          addLabel={t('freePlaces.addParking')}
          onAdd={() => openWizard('parking')}
          addDisabled={zoneId == null}
          selectedName={selectedParking ? (displaySiteName(selectedParking.name) || selectedParking.name) : undefined}
          onEditSelected={selectedParking ? () => setEditItem({ kind: 'parking', id: selectedParking.id, name: selectedParking.name, lat: selectedParking.latitude?.toString() ?? '', lng: selectedParking.longitude?.toString() ?? '', extraId: selectedParking.zoneId ?? zoneId ?? 1 }) : undefined}
          onDeleteSelected={selectedParking ? () => setDeleteItem({ kind: 'parking', id: selectedParking.id, name: selectedParking.name }) : undefined}
          icon={Glyphs.car}
        >
          {parkings.map((item) => (
            <SelectCard
              key={item.id}
              selected={item.id === parkingId}
              title={displaySiteName(item.name) || item.name}
              meta={t('freePlaces.placeMeta', {
                free: item.emptyPlaces ?? 0,
                total: item.totalPlaces ?? 0,
              })}
              onClick={() => setParkingId(item.id)}
              onEdit={() =>
                setEditItem({
                  kind: 'parking',
                  id: item.id,
                  name: item.name,
                  lat: item.latitude?.toString() ?? '',
                  lng: item.longitude?.toString() ?? '',
                  extraId: item.zoneId ?? zoneId ?? 1,
                })
              }
              onDelete={() =>
                setDeleteItem({
                  kind: 'parking',
                  id: item.id,
                  name: item.name,
                })
              }
            />
          ))}
        </HierarchyColumn>

        <HierarchyColumn
          step="4"
          title={t('freePlaces.stepPlace')}
          empty={parkingId == null ? t('freePlaces.needParking') : t('freePlaces.empty')}
          tone="coral"
          addLabel={t('freePlaces.addPlace')}
          onAdd={() => openWizard('place')}
          addDisabled={parkingId == null}
          icon={Glyphs.card}
        >
          {(placesQ.data ?? []).slice(0, 8).map((place) => (
            <SelectCard
              key={place.id}
              selected={false}
              title={place.name}
              meta={place.isEmpty ? t('occupancy.legendFree') : t('occupancy.legendBusy')}
              tone={place.isEmpty ? 'teal' : 'coral'}
              onEdit={() =>
                setEditItem({
                  kind: 'place',
                  id: place.id,
                  name: place.name,
                  lat: place.latitude?.toString() ?? '',
                  lng: place.longitude?.toString() ?? '',
                  extraId: place.parkingId ?? parkingId ?? 1,
                })
              }
              onDelete={() =>
                setDeleteItem({
                  kind: 'place',
                  id: place.id,
                  name: place.name,
                })
              }
            />
          ))}
        </HierarchyColumn>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
        <Typography color="text.secondary" sx={{ flex: 1 }}>
          {t('freePlaces.pickFirst')}
          {selectedBuilding ? ` · ${displaySiteName(selectedBuilding.name) || selectedBuilding.name}` : ''}
          {selectedZone ? ` → ${displaySiteName(selectedZone.name) || selectedZone.name}` : ''}
          {selectedParking ? ` → ${displaySiteName(selectedParking.name) || selectedParking.name}` : ''}
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          disabled={!occupied.length || freeAll.isPending}
          onClick={() => freeAll.mutate()}
        >
          {t('freePlaces.freeAll')}
        </Button>
        <Chip size="small" color="success" label={t('occupancy.live')} />
      </Stack>

      <AsyncBody
        isLoading={placesQ.isLoading && parkingId != null}
        error={placesQ.error ?? parkingsQ.error ?? zonesQ.error ?? buildingsQ.error}
        onRetry={() => {
          void placesQ.refetch();
          void parkingsQ.refetch();
          void zonesQ.refetch();
          void buildingsQ.refetch();
        }}
        isEmpty={false}
      >
        <Stack spacing={2.5}>
          <Section
            title={t('freePlaces.occupiedSection')}
            empty={t('freePlaces.noOccupied')}
            count={occupied.length}
            tone="busy"
          >
            <Box
              sx={{
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' },
              }}
            >
              {occupied.map((place) => (
                <PlaceCard
                  key={place.id}
                  name={place.name}
                  busy
                  pending={busyId === place.id || freeAll.isPending}
                  actionLabel={t('freePlaces.freeOne')}
                  busyLabel={t('occupancy.legendBusy')}
                  freeLabel={t('occupancy.legendFree')}
                  onAction={() => setOccupancy.mutate({ placeId: place.id, isEmpty: true })}
                  onEdit={() =>
                    setEditItem({
                      kind: 'place',
                      id: place.id,
                      name: place.name,
                      lat: place.latitude?.toString() ?? '',
                      lng: place.longitude?.toString() ?? '',
                      extraId: place.parkingId ?? parkingId ?? 1,
                    })
                  }
                  onDelete={() =>
                    setDeleteItem({
                      kind: 'place',
                      id: place.id,
                      name: place.name,
                    })
                  }
                  deleteLabel={t('freePlaces.deletePlace')}
                />
              ))}
            </Box>
          </Section>

          <Section
            title={t('freePlaces.freeSection')}
            empty={t('freePlaces.noFree')}
            count={free.length}
            tone="free"
          >
            <Box
              sx={{
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' },
              }}
            >
              {free.map((place) => (
                <PlaceCard
                  key={place.id}
                  name={place.name}
                  busy={false}
                  pending={busyId === place.id}
                  actionLabel={t('freePlaces.occupyOne')}
                  busyLabel={t('occupancy.legendBusy')}
                  freeLabel={t('occupancy.legendFree')}
                  onAction={() => setOccupancy.mutate({ placeId: place.id, isEmpty: false })}
                  onEdit={() =>
                    setEditItem({
                      kind: 'place',
                      id: place.id,
                      name: place.name,
                      lat: place.latitude?.toString() ?? '',
                      lng: place.longitude?.toString() ?? '',
                      extraId: place.parkingId ?? parkingId ?? 1,
                    })
                  }
                  onDelete={() =>
                    setDeleteItem({
                      kind: 'place',
                      id: place.id,
                      name: place.name,
                    })
                  }
                  deleteLabel={t('freePlaces.deletePlace')}
                />
              ))}
            </Box>
          </Section>
        </Stack>
      </AsyncBody>

      <Dialog open={dialog === 'site'} onClose={() => !pending && setDialog(null)} fullWidth maxWidth="sm">
        <DialogTitle>{t('freePlaces.wizard')}</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {t('freePlaces.wizardHint')}
          </Typography>
          <Stack spacing={2.25} sx={{ mt: 0.5 }}>
            <WizardStep label={t('freePlaces.stepBuilding')}>
              <SourceToggle
                value={wizard.buildingMode}
                existingLabel={t('freePlaces.useExisting')}
                newLabel={t('freePlaces.createNew')}
                onChange={(buildingMode) =>
                  setWizard((current) => ({
                    ...current,
                    buildingMode,
                    zoneMode: buildingMode === 'new' ? 'new' : current.zoneMode,
                  }))
                }
              />
              {wizard.buildingMode === 'existing' ? (
                <ChoiceList
                  items={buildings.map((item) => ({
                    id: item.id,
                    label: displaySiteName(item.name) || item.name,
                  }))}
                  selectedId={wizard.buildingId}
                  onSelect={(id) => setWizard((current) => ({ ...current, buildingId: id }))}
                />
              ) : (
                <TextField
                  fullWidth
                  autoFocus
                  label={t('freePlaces.buildingName')}
                  value={wizard.buildingName}
                  onChange={(event) => setWizard((current) => ({ ...current, buildingName: event.target.value }))}
                />
              )}
            </WizardStep>

            <WizardStep label={t('freePlaces.stepZone')}>
              <SourceToggle
                value={wizard.buildingMode === 'new' ? 'new' : wizard.zoneMode}
                existingLabel={t('freePlaces.useExisting')}
                newLabel={t('freePlaces.createNew')}
                disabled={wizard.buildingMode === 'new'}
                onChange={(zoneMode) => setWizard((current) => ({ ...current, zoneMode }))}
              />
              {wizard.buildingMode !== 'new' && wizard.zoneMode === 'existing' ? (
                <ChoiceList
                  items={(zonesQ.data ?? [])
                    .filter((zone) => !wizard.buildingId || zone.areaId === wizard.buildingId)
                    .map((zone) => ({ id: zone.id, label: displaySiteName(zone.name) || zone.name }))}
                  selectedId={wizard.zoneId}
                  onSelect={(id) => setWizard((current) => ({ ...current, zoneId: id }))}
                />
              ) : (
                <TextField
                  fullWidth
                  label={t('freePlaces.zoneName')}
                  value={wizard.zoneName}
                  onChange={(event) => setWizard((current) => ({ ...current, zoneName: event.target.value }))}
                />
              )}
            </WizardStep>

            <WizardStep label={t('freePlaces.stepParking')}>
              <TextField
                fullWidth
                label={t('freePlaces.parkingName')}
                value={wizard.parkingName}
                onChange={(event) => setWizard((current) => ({ ...current, parkingName: event.target.value }))}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 1.5 }}>
                <TextField
                  fullWidth
                  label={t('freePlaces.latitude')}
                  value={wizard.parkingLat}
                  onChange={(event) => setWizard((current) => ({ ...current, parkingLat: event.target.value }))}
                  placeholder="30.0444"
                />
                <TextField
                  fullWidth
                  label={t('freePlaces.longitude')}
                  value={wizard.parkingLng}
                  onChange={(event) => setWizard((current) => ({ ...current, parkingLng: event.target.value }))}
                  placeholder="31.2357"
                />
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                {t('freePlaces.coordsHint')}
              </Typography>
            </WizardStep>

            <WizardStep label={t('freePlaces.stepPlace')}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField
                  fullWidth
                  label={t('freePlaces.placePrefix')}
                  value={wizard.placePrefix}
                  onChange={(event) => setWizard((current) => ({ ...current, placePrefix: event.target.value }))}
                />
                <TextField
                  fullWidth
                  type="number"
                  label={t('freePlaces.placeCount')}
                  value={wizard.placeCount}
                  onChange={(event) =>
                    setWizard((current) => ({ ...current, placeCount: Number(event.target.value) }))
                  }
                />
              </Stack>
            </WizardStep>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)} disabled={pending}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={() => createSite.mutate()}
            disabled={pending || !wizard.parkingName.trim() || !validLatLng(wizard.parkingLat, wizard.parkingLng)}
          >
            {t('freePlaces.wizard')}
          </Button>
        </DialogActions>
      </Dialog>

      <SimpleNameDialog
        open={dialog === 'building' || dialog === 'zone' || dialog === 'parking' || dialog === 'place'}
        title={
          dialog === 'building'
            ? t('freePlaces.addBuilding')
            : dialog === 'zone'
              ? t('freePlaces.addZone')
              : dialog === 'parking'
                ? t('freePlaces.addParking')
                : t('freePlaces.addPlace')
        }
        label={
          dialog === 'building'
            ? t('freePlaces.buildingName')
            : dialog === 'zone'
              ? t('freePlaces.zoneName')
              : dialog === 'parking'
                ? t('freePlaces.parkingName')
                : t('freePlaces.placeName')
        }
        value={simpleName}
        lat={simpleLat}
        lng={simpleLng}
        showCoords={dialog === 'parking' || dialog === 'place'}
        requireCoords={dialog === 'parking'}
        coordsHint={dialog === 'place' ? t('freePlaces.placeCoordsHint') : t('freePlaces.coordsHint')}
        pending={pending}
        onChange={setSimpleName}
        onLatChange={setSimpleLat}
        onLngChange={setSimpleLng}
        onClose={() => setDialog(null)}
        onSave={() => {
          if (dialog === 'building') createBuilding.mutate();
          if (dialog === 'zone') createZone.mutate();
          if (dialog === 'parking') createParking.mutate();
          if (dialog === 'place') createPlace.mutate();
        }}
      />

      {/* ── Edit Item Dialog ── */}
      {editItem && (
        <SimpleNameDialog
          open={Boolean(editItem)}
          title={
            editItem.kind === 'building'
              ? t('freePlaces.editBuilding')
              : editItem.kind === 'zone'
                ? t('freePlaces.editZone')
                : editItem.kind === 'parking'
                  ? t('freePlaces.editParking')
                  : t('freePlaces.editPlace')
          }
          label={
            editItem.kind === 'building'
              ? t('freePlaces.buildingName')
              : editItem.kind === 'zone'
                ? t('freePlaces.zoneName')
                : editItem.kind === 'parking'
                  ? t('freePlaces.parkingName')
                  : t('freePlaces.placeName')
          }
          value={editItem.name}
          lat={editItem.lat ?? ''}
          lng={editItem.lng ?? ''}
          showCoords={editItem.kind === 'parking' || editItem.kind === 'place'}
          requireCoords={false}
          coordsHint={editItem.kind === 'place' ? t('freePlaces.placeCoordsHint') : t('freePlaces.coordsHint')}
          pending={pending}
          onChange={(name) => setEditItem((prev) => (prev ? { ...prev, name } : null))}
          onLatChange={(lat) => setEditItem((prev) => (prev ? { ...prev, lat } : null))}
          onLngChange={(lng) => setEditItem((prev) => (prev ? { ...prev, lng } : null))}
          onClose={() => setEditItem(null)}
          onSave={() => {
            if (!editItem) return;
            if (editItem.kind === 'building') {
              updateBuilding.mutate({ id: editItem.id, name: editItem.name.trim() });
            } else if (editItem.kind === 'zone') {
              updateZone.mutate({ id: editItem.id, name: editItem.name.trim(), areaId: editItem.extraId ?? buildingId ?? 1 });
            } else if (editItem.kind === 'parking') {
              updateParking.mutate({
                id: editItem.id,
                name: editItem.name.trim(),
                zoneId: editItem.extraId ?? zoneId ?? 1,
                lat: editItem.lat,
                lng: editItem.lng,
              });
            } else if (editItem.kind === 'place') {
              updatePlace.mutate({
                id: editItem.id,
                name: editItem.name.trim(),
                parkingId: editItem.extraId ?? parkingId ?? 1,
                lat: editItem.lat,
                lng: editItem.lng,
              });
            }
          }}
        />
      )}

      {/* ── Delete Confirmation Dialog ── */}
      {deleteItem && (
        <Dialog open={Boolean(deleteItem)} onClose={() => !pending && setDeleteItem(null)} fullWidth maxWidth="xs">
          <DialogTitle>
            {deleteItem.kind === 'building'
              ? t('freePlaces.deleteBuilding')
              : deleteItem.kind === 'zone'
                ? t('freePlaces.deleteZone')
                : deleteItem.kind === 'parking'
                  ? t('freePlaces.deleteParking')
                  : t('freePlaces.deletePlace')}
          </DialogTitle>
          <DialogContent>
            <Typography>
              {deleteItem.kind === 'building'
                ? t('freePlaces.deleteBuildingConfirm', { name: deleteItem.name })
                : deleteItem.kind === 'zone'
                  ? t('freePlaces.deleteZoneConfirm', { name: deleteItem.name })
                  : deleteItem.kind === 'parking'
                    ? t('freePlaces.deleteParkingConfirm', { name: deleteItem.name })
                    : t('freePlaces.deletePlaceConfirm', { name: deleteItem.name })}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteItem(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                if (!deleteItem) return;
                const item = deleteItem;
                setLastAttemptedDelete(item);
                setDeleteItem(null);
                if (item.kind === 'building') deleteBuilding.mutate(item.id);
                else if (item.kind === 'zone') deleteZone.mutate(item.id);
                else if (item.kind === 'parking') deleteParking.mutate(item.id);
                else if (item.kind === 'place') deletePlace.mutate(item.id);
              }}
            >
              {t('common.delete', 'حذف')}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* ── Smart Dependency & Unlink Guide Modal ── */}
      {dependencyModal && (
        <Dialog
          open={Boolean(dependencyModal)}
          onClose={() => setDependencyModal(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              border: `1px solid ${alpha(brand.coral, 0.4)}`,
              boxShadow: `0 24px 60px ${alpha('#000', 0.6)}`,
            },
          }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: brand.coral }}>
            <Typography variant="h6" fontWeight={800}>
              ⚠️ ارتباطات {dependencyModal.kind === 'place' ? 'المكان' : dependencyModal.kind === 'parking' ? 'الموقف' : dependencyModal.kind === 'zone' ? 'المنطقة' : 'المبنى'} ({dependencyModal.name || `#${dependencyModal.id}`})
            </Typography>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              <Alert severity="warning" variant="outlined" sx={{ borderRadius: 2 }}>
                لا يمكن حذف هذا العنصر حالياً من السيرفر نظراً لوجود ارتباطات نشطة (كاميرات، مسارات بوابات، جلسات سيارات، أو نقاط ملاحة).
              </Alert>

              <Typography variant="subtitle2" fontWeight={700}>
                للتحكم وفك الارتباط يدوياً، تفضل بالانتقال إلى الشاشات المخصصة:
              </Typography>

              <Stack spacing={1.5}>
                {/* 1. Cameras */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(brand.teal, 0.08),
                    border: `1px solid ${alpha(brand.teal, 0.25)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  <Stack spacing={0.5}>
                    <Typography variant="body2" fontWeight={700} sx={{ color: brand.teal }}>
                      📷 شاشة إدارة الكاميرات والمسارات
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      تحرير أو إلغاء ربط الكاميرات الموجهة لهذا المكان أو المسار.
                    </Typography>
                  </Stack>
                  <Button
                    variant="outlined"
                    size="small"
                    color="info"
                    component={RouterLink}
                    to="/admin/cameras"
                    onClick={() => setDependencyModal(null)}
                    sx={{ whiteSpace: 'nowrap', fontWeight: 700 }}
                  >
                    الانتقال للكاميرات ↗
                  </Button>
                </Box>

                {/* 2. Simulator & Sessions */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha('#3b82f6', 0.08),
                    border: `1px solid ${alpha('#3b82f6', 0.25)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  <Stack spacing={0.5}>
                    <Typography variant="body2" fontWeight={700} sx={{ color: '#3b82f6' }}>
                      🚗 إدارة الجلسات وحركة السيارات
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      متابعة وإنهاء الجلسات الحالية للسيارات في هذا الموقف.
                    </Typography>
                  </Stack>
                  <Button
                    variant="outlined"
                    size="small"
                    color="primary"
                    component={RouterLink}
                    to="/parking-sessions"
                    onClick={() => setDependencyModal(null)}
                    sx={{ whiteSpace: 'nowrap', fontWeight: 700 }}
                  >
                    الانتقال للجلسات ↗
                  </Button>
                </Box>

                {/* 3. Indoor Map */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha('#a855f7', 0.08),
                    border: `1px solid ${alpha('#a855f7', 0.25)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  <Stack spacing={0.5}>
                    <Typography variant="body2" fontWeight={700} sx={{ color: '#a855f7' }}>
                      🗺️ الخريطة التفاعلية ونقاط الملاحة
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      تعديل أو حذف نقاط الملاحة المرتبطة بهذا الموقع.
                    </Typography>
                  </Stack>
                  <Button
                    variant="outlined"
                    size="small"
                    color="secondary"
                    component={RouterLink}
                    to="/admin/indoor-map"
                    onClick={() => setDependencyModal(null)}
                    sx={{ whiteSpace: 'nowrap', fontWeight: 700 }}
                  >
                    الانتقال للخريطة ↗
                  </Button>
                </Box>
              </Stack>

              {/* 4. Quick Action for Places: Vacate Slot */}
              {dependencyModal.kind === 'place' && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(brand.coral, 0.08),
                    border: `1px dashed ${alpha(brand.coral, 0.4)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  <Stack spacing={0.5}>
                    <Typography variant="body2" fontWeight={700} color="error.main">
                      ⚡ تفريغ المكان وجعله شاغراً فوراً
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      تصفير حالة الإشغال (Empty) للمكان لإلغاء أي حجز نشط.
                    </Typography>
                  </Stack>
                  <Button
                    variant="contained"
                    size="small"
                    color="warning"
                    onClick={async () => {
                      const id = dependencyModal.id;
                      setDependencyModal(null);
                      await setOccupancy.mutateAsync({ placeId: id, isEmpty: true });
                    }}
                    sx={{ whiteSpace: 'nowrap', fontWeight: 700 }}
                  >
                    تفريغ المكان الآن
                  </Button>
                </Box>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button variant="outlined" onClick={() => setDependencyModal(null)}>
              إغلاق
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Stack>
  );
}

function HierarchyColumn({
  step,
  title,
  empty,
  tone,
  addLabel,
  onAdd,
  addDisabled,
  selectedName,
  onEditSelected,
  onDeleteSelected,
  icon,
  children,
}: {
  step: string;
  title: string;
  empty: string;
  tone: 'violet' | 'gold' | 'teal' | 'coral';
  addLabel: string;
  onAdd: () => void;
  addDisabled?: boolean;
  selectedName?: string;
  onEditSelected?: () => void;
  onDeleteSelected?: () => void;
  icon: ReactNode;
  children: ReactNode;
}) {
  const color =
    tone === 'violet' ? brand.violet : tone === 'gold' ? brand.amber : tone === 'coral' ? brand.coral : brand.teal;
  const items = Array.isArray(children) ? children : children ? [children] : [];
  const hasItems = items.filter(Boolean).length > 0;
  return (
    <Box
      sx={{
        ...glowPanel(color),
        p: 1.75,
        minHeight: 280,
        boxShadow: `0 0 0 1px ${alpha(color, 0.28)}, 0 0 28px ${alpha(color, 0.12)}`,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        <IconTile tone={tone === 'gold' ? 'gold' : tone === 'coral' ? 'coral' : tone === 'violet' ? 'violet' : 'teal'} size={36}>
          {icon}
        </IconTile>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" sx={{ color, fontWeight: 800 }}>
            {step}
          </Typography>
          <Typography fontWeight={800} noWrap>
            {title}
          </Typography>
        </Box>
      </Stack>
      <Button size="small" fullWidth variant="outlined" disabled={addDisabled} onClick={onAdd} sx={{ mb: 1.25, fontWeight: 700 }}>
        {addLabel}
      </Button>

      {selectedName && (onEditSelected || onDeleteSelected) && (
        <Stack
          direction="row"
          spacing={0.75}
          alignItems="center"
          justifyContent="space-between"
          sx={{
            mb: 1.25,
            p: 1,
            borderRadius: 2,
            background: alpha('#fff', 0.07),
            border: `1px solid ${alpha(color, 0.4)}`,
          }}
        >
          <Typography variant="caption" fontWeight={800} noWrap sx={{ maxWidth: '48%', color }}>
            {selectedName}
          </Typography>
          <Stack direction="row" spacing={0.5}>
            {onEditSelected && (
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={onEditSelected}
                sx={{
                  minWidth: 'auto',
                  px: 0.9,
                  py: 0.2,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                }}
              >
                ✏️ تعديل
              </Button>
            )}
            {onDeleteSelected && (
              <Button
                size="small"
                variant="contained"
                color="error"
                onClick={onDeleteSelected}
                sx={{
                  minWidth: 'auto',
                  px: 0.9,
                  py: 0.2,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                }}
              >
                🗑️ حذف
              </Button>
            )}
          </Stack>
        </Stack>
      )}

      <Stack spacing={1}>
        {hasItems ? children : <Typography color="text.secondary">{empty}</Typography>}
      </Stack>
    </Box>
  );
}

function SelectCard({
  title,
  meta,
  selected,
  onClick,
  onEdit,
  onDelete,
  tone = 'teal',
}: {
  title: string;
  meta: string;
  selected: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  tone?: 'teal' | 'coral';
}) {
  const color = selected ? brand.teal : tone === 'coral' ? brand.coral : alpha('#fff', 0.35);
  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: 2.5,
        cursor: onClick ? 'pointer' : 'default',
        border: `1.5px solid ${alpha(color, selected ? 0.85 : 0.25)}`,
        background: selected ? alpha(brand.teal, 0.16) : alpha('#fff', 0.04),
        boxShadow: selected ? `0 0 20px ${alpha(brand.teal, 0.3)}` : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        transition: 'all 200ms ease',
        '&:hover': {
          borderColor: alpha(color, 0.7),
          background: selected ? alpha(brand.teal, 0.22) : alpha('#fff', 0.08),
        },
      }}
    >
      <Box onClick={onClick} sx={{ flex: 1, minWidth: 0 }}>
        <Typography fontWeight={800} noWrap sx={{ fontSize: '0.95rem' }}>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
          {meta}
        </Typography>
      </Box>
      {(onEdit || onDelete) && (
        <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }} alignItems="center">
          {onEdit && (
            <Button
              size="small"
              variant="outlined"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              sx={{
                minWidth: 'auto',
                px: 0.9,
                py: 0.2,
                fontSize: '0.72rem',
                fontWeight: 700,
                borderColor: alpha(brand.teal, 0.5),
                color: brand.teal,
                bgcolor: alpha(brand.teal, 0.08),
                '&:hover': {
                  borderColor: brand.teal,
                  bgcolor: alpha(brand.teal, 0.2),
                },
              }}
            >
              ✏️ تعديل
            </Button>
          )}
          {onDelete && (
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              sx={{
                minWidth: 'auto',
                px: 0.9,
                py: 0.2,
                fontSize: '0.72rem',
                fontWeight: 700,
                borderColor: alpha('#ff4d4f', 0.5),
                color: '#ff4d4f',
                bgcolor: alpha('#ff4d4f', 0.08),
                '&:hover': {
                  borderColor: '#ff4d4f',
                  bgcolor: alpha('#ff4d4f', 0.2),
                },
              }}
            >
              🗑️ حذف
            </Button>
          )}
        </Stack>
      )}
    </Box>
  );
}

function WizardStep({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box sx={{ ...glassPanel(), p: 1.75 }}>
      <Typography fontWeight={800} sx={{ mb: 1.25 }}>
        {label}
      </Typography>
      <Stack spacing={1.25}>{children}</Stack>
    </Box>
  );
}

function SourceToggle({
  value,
  existingLabel,
  newLabel,
  onChange,
  disabled,
}: {
  value: SourceMode;
  existingLabel: string;
  newLabel: string;
  onChange: (value: SourceMode) => void;
  disabled?: boolean;
}) {
  return (
    <ToggleButtonGroup
      exclusive
      fullWidth
      size="small"
      disabled={disabled}
      value={value}
      onChange={(_event, next: SourceMode | null) => {
        if (next) onChange(next);
      }}
    >
      <ToggleButton value="existing">{existingLabel}</ToggleButton>
      <ToggleButton value="new">{newLabel}</ToggleButton>
    </ToggleButtonGroup>
  );
}

function ChoiceList({
  items,
  selectedId,
  onSelect,
}: {
  items: { id: number; label: string }[];
  selectedId: number;
  onSelect: (id: number) => void;
}) {
  if (items.length === 0) {
    return <Typography color="text.secondary">—</Typography>;
  }
  return (
    <Stack spacing={0.75}>
      {items.map((item) => (
        <SelectCard
          key={item.id}
          title={item.label}
          meta=""
          selected={item.id === selectedId}
          onClick={() => onSelect(item.id)}
        />
      ))}
    </Stack>
  );
}

function SimpleNameDialog({
  open,
  title,
  label,
  value,
  lat = '',
  lng = '',
  showCoords = false,
  requireCoords = false,
  coordsHint,
  pending,
  onChange,
  onLatChange,
  onLngChange,
  onClose,
  onSave,
}: {
  open: boolean;
  title: string;
  label: string;
  value: string;
  lat?: string;
  lng?: string;
  showCoords?: boolean;
  requireCoords?: boolean;
  coordsHint?: string;
  pending: boolean;
  onChange: (value: string) => void;
  onLatChange?: (value: string) => void;
  onLngChange?: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const { t } = useTranslation();
  const coordsOk = !requireCoords || validLatLng(lat, lng) != null;
  return (
    <Dialog open={open} onClose={() => !pending && onClose()} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          margin="dense"
          label={label}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && value.trim() && coordsOk) onSave();
          }}
        />
        {showCoords && (
          <Stack spacing={1.25} sx={{ mt: 1.5 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
              <TextField
                fullWidth
                label={t('freePlaces.latitude')}
                value={lat}
                onChange={(event) => onLatChange?.(event.target.value)}
                placeholder="30.0444"
              />
              <TextField
                fullWidth
                label={t('freePlaces.longitude')}
                value={lng}
                onChange={(event) => onLngChange?.(event.target.value)}
                placeholder="31.2357"
              />
            </Stack>
            {coordsHint && (
              <Typography variant="caption" color="text.secondary">
                {coordsHint}
              </Typography>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={pending}>
          {t('common.cancel')}
        </Button>
        <Button variant="contained" onClick={onSave} disabled={!value.trim() || !coordsOk || pending}>
          {title}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function Section({
  title,
  empty,
  count,
  tone,
  children,
}: {
  title: string;
  empty: string;
  count: number;
  tone: 'free' | 'busy';
  children: ReactNode;
}) {
  const color = tone === 'free' ? brand.teal : brand.coral;
  return (
    <Box
      sx={{
        ...glowPanel(color),
        p: 2.25,
        boxShadow: `0 0 0 1px ${alpha(color, 0.28)}, 0 0 36px ${alpha(color, 0.12)}, 0 24px 48px ${alpha('#000', 0.4)}`,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.75 }}>
        <Typography variant="h6">{title}</Typography>
        <Chip size="small" label={count} sx={{ bgcolor: alpha(color, 0.15), color, fontWeight: 800 }} />
      </Stack>
      {count === 0 ? <Typography color="text.secondary">{empty}</Typography> : children}
    </Box>
  );
}

function PlaceCard({
  name,
  busy,
  pending,
  actionLabel,
  onAction,
  busyLabel,
  freeLabel,
  onEdit,
  onDelete,
  deleteLabel,
}: {
  name: string;
  busy: boolean;
  pending: boolean;
  actionLabel: string;
  onAction: () => void;
  busyLabel: string;
  freeLabel: string;
  onEdit?: () => void;
  onDelete: () => void;
  deleteLabel: string;
}) {
  const glow = busy ? brand.coral : brand.teal;
  return (
    <Box
      sx={{
        p: 1.75,
        borderRadius: 3,
        background: `linear-gradient(145deg, ${alpha('#fff', 0.08)}, ${alpha('#fff', 0.02)})`,
        border: `1px solid ${alpha(glow, 0.45)}`,
        boxShadow: `0 0 0 1px ${alpha(glow, 0.2)}, 0 0 22px ${alpha(glow, 0.22)}, inset 0 1px 0 ${alpha('#fff', 0.12)}`,
        transition: 'transform 200ms ease, box-shadow 200ms ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: `0 0 0 1px ${alpha(glow, 0.45)}, 0 0 32px ${alpha(glow, 0.35)}, 0 16px 32px ${alpha('#000', 0.35)}`,
        },
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={1.25} alignItems="center">
          <IconTile tone={busy ? 'coral' : 'mint'} size={40}>
            {Glyphs.car}
          </IconTile>
          <Box>
            <Typography fontWeight={800}>{name}</Typography>
            <Typography variant="caption" sx={{ color: glow, fontWeight: 700 }}>
              {busy ? `● ${busyLabel}` : `● ${freeLabel}`}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={0.75} alignItems="center">
          {onEdit && (
            <Button
              size="small"
              variant="outlined"
              color="primary"
              disabled={pending}
              onClick={onEdit}
              sx={{ minWidth: 'auto', px: 1, py: 0.4, fontWeight: 700 }}
            >
              ✏️ تعديل
            </Button>
          )}
          <Button
            size="small"
            variant="outlined"
            color="error"
            disabled={pending}
            onClick={onDelete}
            sx={{ minWidth: 'auto', px: 1, py: 0.4, fontWeight: 700 }}
          >
            🗑️ {deleteLabel}
          </Button>
          <Button
            size="small"
            variant="contained"
            color={busy ? 'secondary' : 'primary'}
            disabled={pending}
            onClick={onAction}
            sx={{ minWidth: 'auto', px: 1.5, py: 0.4, fontWeight: 700 }}
          >
            {actionLabel}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
