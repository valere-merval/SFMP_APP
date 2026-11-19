import React, { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getScreenCopy } from '../screenCopy';
import type { LiveData, MatchCard } from '../types';
import { Card, EmptyState, Pill, PrimaryButton, SecondaryButton, Stat, styles } from '../ui';
import { openGoogleMapsDirections, openGoogleMapsSearch } from '../maps';
import type { Locale } from '../i18n';

type TransitRoute = {
  id: string;
  mode: 'shuttle' | 'metro' | 'train' | 'bus' | 'eScooter' | 'taxi' | 'vtc';
  title: string;
  subtitle: string;
  badge: string;
  duration: string;
  price: string;
  status: string;
  details: string[];
  active: boolean;
  canReserve: boolean;
  ctaLabel: string;
};

function formatCountdown(date: string, time: string) {
  const target = new Date(`${date}T${time.length === 5 ? `${time}:00` : time}`);
  if (Number.isNaN(target.getTime())) return 'LIVE';
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return 'LIVE';
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${days.toString().padStart(2, '0')}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
}

function routeGroups(match: MatchCard): Array<{ key: TransitRoute['mode']; label: string; summary: string; routes: TransitRoute[] }> {
  return [
    {
      key: 'shuttle',
      label: 'Shuttle',
      summary: 'Direct matchday shuttles',
      routes: [
        {
          id: `${match.id}-shuttle-s2`,
          mode: 'shuttle',
          title: 'Shuttle Line S2',
          subtitle: 'BEST ROUTE · Direct to Gate 34',
          badge: 'Free Pass',
          duration: '19 min',
          price: 'Free',
          status: 'Active',
          details: ['Gate 34 direct access', 'Lowest walking time', 'Dedicated fan lane'],
          active: true,
          canReserve: false,
          ctaLabel: 'Open route',
        },
      ],
    },
    {
      key: 'metro',
      label: 'Metro',
      summary: 'Underground connections',
      routes: [
        {
          id: `${match.id}-metro-7`,
          mode: 'metro',
          title: 'Metro Line 7',
          subtitle: 'Estadio Metropolitano · 3m freq',
          badge: 'Free Pass',
          duration: '28 min',
          price: 'Free',
          status: 'Active',
          details: ['Frequent departures', 'Station to stadium wayfinding', 'Works for large crowds'],
          active: true,
          canReserve: false,
          ctaLabel: 'Open route',
        },
      ],
    },
    {
      key: 'train',
      label: 'Train',
      summary: 'Regional and suburban rail',
      routes: [
        {
          id: `${match.id}-train-regional`,
          mode: 'train',
          title: 'Matchday Rail',
          subtitle: 'Central Station · Fan release window',
          badge: 'Published',
          duration: '31 min',
          price: '€4.90',
          status: 'Active',
          details: ['Best for city-center arrivals', 'Timed to kick-off', 'Published by admin'],
          active: true,
          canReserve: false,
          ctaLabel: 'Open route',
        },
      ],
    },
    {
      key: 'bus',
      label: 'Bus',
      summary: 'Registered match buses',
      routes: [
        {
          id: `${match.id}-bus-express`,
          mode: 'bus',
          title: 'Bus Express B12',
          subtitle: 'Drop-off ring road · Fast lane',
          badge: 'Priority',
          duration: '24 min',
          price: '€2.20',
          status: 'Active',
          details: ['Registered for the match', 'Drop-off near sector access', 'Priority boarding'],
          active: true,
          canReserve: false,
          ctaLabel: 'Open route',
        },
      ],
    },
    {
      key: 'eScooter',
      label: 'E-scooter',
      summary: 'Admin-published micromobility',
      routes: [
        {
          id: `${match.id}-escooter-zone`,
          mode: 'eScooter',
          title: 'E-Scooter Bay',
          subtitle: 'Reserved parking bay · 42 hubs',
          badge: 'Published',
          duration: '14 min',
          price: '€2.50 base',
          status: 'Active',
          details: ['Published by administrator', 'Fastest short-distance option', 'Park near the fan gate'],
          active: true,
          canReserve: false,
          ctaLabel: 'Open route',
        },
      ],
    },
    {
      key: 'taxi',
      label: 'Taxi',
      summary: 'Registered taxi ranks',
      routes: [
        {
          id: `${match.id}-taxi-south`,
          mode: 'taxi',
          title: 'Taxi Zone South',
          subtitle: 'Registered for the match · Fast lane',
          badge: 'Active',
          duration: '14 min',
          price: '€18.50',
          status: 'Available',
          details: ['Registered taxi only', 'Priority matchday lane', 'Can reserve or pay now'],
          active: true,
          canReserve: true,
          ctaLabel: 'Reserve / pay',
        },
      ],
    },
    {
      key: 'vtc',
      label: 'VTC',
      summary: 'Pre-booked ride-hailing',
      routes: [
        {
          id: `${match.id}-vtc-south`,
          mode: 'vtc',
          title: 'VTC Zone South',
          subtitle: 'Drop-off ring road · Priority pass',
          badge: 'Best route',
          duration: '24 min',
          price: '€22.00',
          status: 'Available',
          details: ['Reserved ride-hailing lane', 'Quick drop-off', 'Can reserve or pay now'],
          active: true,
          canReserve: true,
          ctaLabel: 'Reserve / pay',
        },
      ],
    },
  ];
}

export function JourneyScreen({ data, loading, locale, selectedMatch }: { data: LiveData | null; loading: boolean; locale: Locale; selectedMatch: MatchCard | null }) {
  const copy = getScreenCopy(locale).journey;
  const match = selectedMatch;
  const venueCoordinate = { latitude: 40.4531, longitude: -3.6883 };
  const [activeGroup, setActiveGroup] = useState<TransitRoute['mode']>('shuttle');
  const [activeRouteId, setActiveRouteId] = useState<string | null>(null);
  const [reservationMessage, setReservationMessage] = useState<string | null>(null);

  const groups = useMemo(() => (match ? routeGroups(match) : []), [match]);
  const activeGroupData = groups.find((group) => group.key === activeGroup) ?? groups[0] ?? null;
  const activeRoute = activeGroupData?.routes.find((route) => route.id === activeRouteId) ?? activeGroupData?.routes[0] ?? null;
  const countdown = match ? formatCountdown(match.date, match.time) : 'LIVE';

  useEffect(() => {
    if (!groups.length) {
      setActiveRouteId(null);
      setReservationMessage(null);
      return;
    }

    if (!groups.some((group) => group.key === activeGroup)) {
      setActiveGroup(groups[0].key);
    }

    const firstRoute = groups[0].routes[0] ?? null;
    setActiveRouteId(firstRoute?.id ?? null);
    setReservationMessage(null);
  }, [activeGroup, groups, match?.id]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>{copy.eyebrow}</Text>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.subtitle}>{copy.subtitle}</Text>
        </View>

        {match ? (
          <Card title="Match details" subtitle="Live overview" wide>
            <View style={styles.heroCard}>
              <View style={styles.heroRow}>
                <Pill>{match.status}</Pill>
                <Pill subtle>{match.stage}</Pill>
                <Pill subtle>{match.weather} · {match.temperature}</Pill>
              </View>
              <Text style={styles.cardKicker}>{match.country}</Text>
              <Text style={styles.cardTitle}>{match.homeTeam} vs {match.awayTeam}</Text>
              <Text style={styles.muted}>{match.venue} · {match.city}</Text>
              <View style={styles.statsRow}>
                <Stat label="Kickoff" value={match.time} />
                <Stat label="Countdown" value={countdown} />
                <Stat label="Gate" value={match.gate} />
              </View>
              <View style={styles.statsRow}>
                <Stat label="Section" value={match.sector} />
                <Stat label="Weather" value={`${match.weather} · ${match.temperature}`} />
                <Stat label="Ticket" value={match.ticketAvailable ? match.ticketPrice || 'Available' : 'N/A'} />
              </View>
              <View style={styles.ctaRow}>
                <PrimaryButton label="Plan My Journey" onPress={() => setActiveGroup('shuttle')} icon={<Ionicons name="map-outline" size={16} color="#fff" />} />
                <SecondaryButton label="Gate Pass" onPress={() => setActiveGroup('taxi')} icon={<Ionicons name="ticket-outline" size={16} color="#1d3fb3" />} />
              </View>
            </View>
          </Card>
        ) : (
          <Card title={copy.plannerTitle} subtitle={copy.plannerSubtitle} wide>
            <EmptyState icon="map-outline" title="No match selected" subtitle="Choose a match to unlock the map and transport planner." />
          </Card>
        )}

        <Card title="SpielTag Route" subtitle="Direct stadium guidance" wide>
          {match ? (
            <View style={styles.mapPanel}>
              <MapView
                style={styles.mapView}
                initialRegion={{
                  latitude: venueCoordinate.latitude,
                  longitude: venueCoordinate.longitude,
                  latitudeDelta: 0.03,
                  longitudeDelta: 0.03,
                }}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                showsCompass={false}
                showsTraffic
              >
                <Marker coordinate={venueCoordinate} title={match.venue} description={`${match.gate} · ${match.sector}`} />
              </MapView>
              <View style={styles.mapOverlay}>
                <Text style={styles.cardTitle}>{match.venue}</Text>
                <Text style={styles.muted}>{match.city}, {match.country}</Text>
                <Text style={styles.muted}>Gate {match.gate} · Section {match.sector}</Text>
              </View>
            </View>
          ) : (
            <EmptyState icon="navigate-outline" title="Route map unavailable" subtitle="Select a match to view the native stadium map." />
          )}
          <View style={styles.ctaRow}>
            <SecondaryButton label="Open in Google Maps" onPress={() => match ? openGoogleMapsDirections(`${match.venue}, ${match.city}`, 'Madrid city center') : undefined} icon={<Feather name="external-link" size={16} color="#1d3fb3" />} />
            <SecondaryButton label="Find venue" onPress={() => match ? openGoogleMapsSearch(`${match.venue}, ${match.city}`) : undefined} icon={<Feather name="search" size={16} color="#1d3fb3" />} />
          </View>
        </Card>

        <Card title="Transit Direct Lines" subtitle="Tap a mode to open its list" wide>
          <View style={styles.grid2}>
            {groups.map((group) => (
              <Pressable
                key={group.key}
                onPress={() => {
                  setActiveGroup(group.key);
                  setActiveRouteId(group.routes[0]?.id ?? null);
                  setReservationMessage(null);
                }}
                style={[localStyles.groupCard, activeGroup === group.key && localStyles.groupCardActive]}
              >
                <Text style={localStyles.groupBadge}>{group.label}</Text>
                <Text style={localStyles.groupTitle}>{group.routes[0]?.title ?? group.label}</Text>
                <Text style={localStyles.groupMeta}>{group.summary}</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        {activeGroupData ? (
          <Card title={`${activeGroupData.label} routes`} subtitle="Available options" wide>
            <View style={styles.cardBody}>
              {activeGroupData.routes.map((route) => (
                <Pressable
                  key={route.id}
                  onPress={() => {
                    setActiveRouteId(route.id);
                    setReservationMessage(null);
                  }}
                  style={[localStyles.routeCard, activeRoute?.id === route.id && localStyles.routeCardActive]}
                >
                  <View style={styles.rowBetween}>
                    <Text style={localStyles.routeTitle}>{route.title}</Text>
                    <Pill subtle>{route.badge}</Pill>
                  </View>
                  <Text style={styles.muted}>{route.subtitle}</Text>
                  <View style={styles.rowBetween}>
                    <Text style={localStyles.routeMeta}>{route.duration}</Text>
                    <Text style={localStyles.routeMeta}>{route.price}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </Card>
        ) : null}

        {activeRoute ? (
          <Card title={activeRoute.title} subtitle="Details & actions" wide>
            <View style={styles.cardBody}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>{activeRoute.title}</Text>
                <Pill subtle>{activeRoute.status}</Pill>
              </View>
              <Text style={styles.muted}>{activeRoute.subtitle}</Text>
              <View style={styles.statsRow}>
                <Stat label="Duration" value={activeRoute.duration} />
                <Stat label="Price" value={activeRoute.price} />
                <Stat label="Mode" value={activeRoute.mode.toUpperCase()} />
              </View>
              {activeRoute.details.map((detail) => (
                <View key={detail} style={styles.bulletRow}>
                  <Feather name="check-circle" size={16} color="#2457e6" />
                  <Text style={styles.muted}>{detail}</Text>
                </View>
              ))}
              {activeRoute.canReserve ? (
                <View style={styles.ctaRow}>
                  <PrimaryButton
                    label={activeRoute.ctaLabel}
                    onPress={() => setReservationMessage(`Reserved locally: ${activeRoute.title}`)}
                    icon={<Ionicons name="card-outline" size={16} color="#fff" />}
                  />
                  <SecondaryButton
                    label="Open route"
                    onPress={() => match ? openGoogleMapsDirections(`${match.venue}, ${match.city}`, 'Madrid city center') : undefined}
                    icon={<Feather name="navigation" size={16} color="#1d3fb3" />}
                  />
                </View>
              ) : (
                <View style={styles.ctaRow}>
                  <PrimaryButton
                    label={activeRoute.ctaLabel}
                    onPress={() => match ? openGoogleMapsDirections(`${match.venue}, ${match.city}`, 'Madrid city center') : undefined}
                    icon={<Feather name="navigation" size={16} color="#fff" />}
                  />
                </View>
              )}
              {reservationMessage ? <Text style={styles.helperText}>{reservationMessage}</Text> : null}
            </View>
          </Card>
        ) : null}

        <Card title={copy.checkoutTitle} subtitle={copy.checkoutSubtitle}>
          {data ? (
            data.bookings.map((item) => (
              <View key={item.id} style={styles.row}>
                <View style={styles.rowLeft}>
                  <Text style={styles.rowTitle}>{item.fanName}</Text>
                  <Text style={styles.muted}>{item.option} · {item.status}</Text>
                </View>
                <View style={styles.rowRight}>
                  <Text style={styles.rowTitle}>{item.time}</Text>
                  <Text style={styles.muted}>Departure</Text>
                </View>
              </View>
            ))
          ) : loading ? (
            <EmptyState icon="time-outline" title={copy.loadingTitle} subtitle={copy.loadingBody} />
          ) : (
            <EmptyState icon="ticket-outline" title={copy.emptyTitle} subtitle={copy.emptyBody} />
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const localStyles = {
  groupCard: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#dbe4ff',
    backgroundColor: '#f8fafc',
    gap: 6,
  },
  groupCardActive: {
    backgroundColor: '#edf2ff',
    borderColor: '#2457e6',
  },
  groupBadge: {
    color: '#2457e6',
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  groupTitle: {
    color: '#172033',
    fontSize: 16,
    fontFamily: 'Poppins-ExtraBold',
  },
  groupMeta: {
    color: '#60708b',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  routeCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e6eaf0',
    backgroundColor: '#fff',
    gap: 6,
  },
  routeCardActive: {
    borderColor: '#2457e6',
    backgroundColor: '#f6f8fc',
  },
  routeTitle: {
    color: '#172033',
    fontSize: 16,
    fontFamily: 'Poppins-ExtraBold',
  },
  routeMeta: {
    color: '#60708b',
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
};
