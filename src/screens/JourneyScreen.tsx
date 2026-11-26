import React, { useEffect, useMemo, useState } from 'react';
import { Linking, Modal, Pressable, ScrollView, Text, View, AccessibilityInfo } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapboxNaviView from '../components/MapboxNaviView';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { acceptRideRequest, createRideRequest, getRideRequest, getSessionUser, getAuthToken, listAssignedDriverRideRequests, listDriverRideRequests, listPassengerRideRequests, listPublicTransportProfiles, loadTransportAvailability, refuseRideRequest, markRideRequestArrived, startRideRequestTrip, completeRideRequestTrip } from '../api';
import { getScreenCopy } from '../screenCopy';
import { googleMapsDirectionsUrl, openGoogleMapsDirections, buildRideRouteCoordinates, rideStatusStyle } from '../maps';
import { Card, EmptyState, Pill, PrimaryButton, SecondaryButton, styles } from '../ui';
import type { LiveData, MatchCard, RideRequestView, TransportAvailabilityView, TransportProviderView } from '../types';
import { t, type Locale } from '../i18n';
import { loadVoiceGuidanceEnabled, saveVoiceGuidanceEnabled, speakVoiceGuidance, stopVoiceGuidance } from '../voice';

type ModeKey = 'bus' | 'train' | 'metro' | 'scooter' | 'bike' | 'taxi' | 'vtc';

const modeCards: Array<{ key: ModeKey; label: string; subtitle: string; icon: React.ReactNode; regex: RegExp }> = [
  { key: 'bus', label: 'Bus', subtitle: 'Walk to the station', icon: <Ionicons name="bus-outline" size={20} color="#f8fafc" />, regex: /bus/i },
  { key: 'train', label: 'Train', subtitle: 'Walk to the station', icon: <Ionicons name="train-outline" size={20} color="#f8fafc" />, regex: /train/i },
  { key: 'metro', label: 'Metro', subtitle: 'Walk to the station', icon: <Ionicons name="subway-outline" size={20} color="#f8fafc" />, regex: /metro|subway/i },
  { key: 'scooter', label: 'Scooter', subtitle: 'Walk to the scooter', icon: <Feather name="navigation" size={20} color="#f8fafc" />, regex: /scooter/i },
  { key: 'bike', label: 'Bike', subtitle: 'Walk to the bike', icon: <Feather name="map-pin" size={20} color="#f8fafc" />, regex: /bike|bicycle/i },
  { key: 'taxi', label: 'Taxi', subtitle: 'Send a live request', icon: <Ionicons name="car-outline" size={20} color="#f8fafc" />, regex: /taxi/i },
  { key: 'vtc', label: 'VTC', subtitle: 'Send a live request', icon: <Ionicons name="car-sport-outline" size={20} color="#f8fafc" />, regex: /vtc|chauffeur|driver/i },
];

const floatingExpandButtonStyle = {
  position: 'absolute',
  top: 12,
  right: 12,
  width: 38,
  height: 38,
  borderRadius: 19,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(16,27,45,0.9)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.14)',
} as const;

const statusBadgeStyle = { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 } as const;

const statusTextStyle = { fontFamily: 'Poppins-SemiBold' } as const;

const compactPageStyle = { paddingTop: 12 } as const;
const compactHeaderStyle = { marginBottom: 0 } as const;
const expandedMapStyle = { minHeight: 620 } as const;

const J = {
  en: {
    liveRideInProgress: 'Live ride in progress',
    passengerIsAwayEta: 'Passenger is {distance} km away · ETA {eta} min',
    passengerLocationLive: 'Passenger location is live and updates on the map.',
    navigateToPickup: 'Navigate to pickup',
    openDestinationRoute: 'Open destination route',
    followDestinationRoute: 'Follow destination route',
    arrivedAtPickup: 'Arrived at pickup',
    startTrip: 'Start trip',
    completeTrip: 'Complete trip',
    voiceGuidance: 'Voice guidance',
    availableTransportModes: 'Available transport modes',
    pickYourLiveRideType: 'Pick your live ride type',
    yourDriver: 'Your driver',
    vehiclePlatePending: 'Plate pending',
    distanceUpdating: 'Distance updating',
    etaUpdating: 'ETA updating',
    tripRouteLive: 'The trip route is now live on the map until the final destination.',
    signInAgainToSendRequest: 'Sign in again to send a live transport request.',
    requestCouldNotBeCreated: 'The ride request could not be created. Please try again.',
    driverAcceptedThisRequest: 'You accepted this request. Open the map to drive to the passenger, then mark arrival and start the trip.',
    openMapToDriveToPassenger: 'Open the map to drive to the passenger',
    requestSentToDriver: 'Request sent to the driver. Waiting for a response.',
    waitingForAcceptOrRefuse: 'Waiting for accept or refuse',
    driverComingToPickup: 'The driver is coming to your pickup point and the route is live.',
    driverArrivedAtPickup: 'The driver has arrived at the pickup point.',
    driverTakingToFinalDestination: 'The driver is now taking you to the final destination.',
    driverRefusedAnother: 'The driver refused this request. Select another available chauffeur.',
    tripInProgress: 'Trip in progress',
    tripCompleted: 'Trip completed',
    readyForNextRequest: 'Ready for the next request',
    passengerReachedDestination: 'Passenger has reached the destination.',
    liveRequestTracking: 'Live request tracking',
    waitingForNextStep: 'Waiting for the next step',
    acceptRideToShowRouting: 'Accept a ride to show live pickup and destination routing.',
  },

  fr: {
    liveRideInProgress: 'Trajet en direct',
    passengerIsAwayEta: 'Le passager est à {distance} km · ETA {eta} min',
    passengerLocationLive: 'La position du passager est en direct et se met à jour sur la carte.',
    navigateToPickup: 'Aller au point de prise en charge',
    openDestinationRoute: 'Ouvrir l’itinéraire vers la destination',
    followDestinationRoute: 'Suivre l’itinéraire de destination',
    arrivedAtPickup: 'Arrivé au point de prise en charge',
    startTrip: 'Démarrer le trajet',
    completeTrip: 'Terminer le trajet',
    voiceGuidance: 'Guidage vocal',
    availableTransportModes: 'Modes de transport disponibles',
    pickYourLiveRideType: 'Choisissez votre type de trajet en direct',
    yourDriver: 'Votre chauffeur',
    vehiclePlatePending: 'Plaque en attente',
    distanceUpdating: 'Distance en cours de mise à jour',
    etaUpdating: 'ETA en cours de mise à jour',
    tripRouteLive: 'L’itinéraire est maintenant en direct sur la carte jusqu’à la destination finale.',
    signInAgainToSendRequest: 'Reconnectez-vous pour envoyer une demande de transport en direct.',
    requestCouldNotBeCreated: 'La demande de trajet n’a pas pu être créée. Veuillez réessayer.',
    driverAcceptedThisRequest: 'Vous avez accepté cette demande. Ouvrez la carte pour aller vers le passager, puis marquez l’arrivée et démarrez le trajet.',
    openMapToDriveToPassenger: 'Ouvrir la carte pour aller vers le passager',
    requestSentToDriver: 'Demande envoyée au chauffeur. En attente de réponse.',
    waitingForAcceptOrRefuse: 'En attente d’acceptation ou de refus',
    driverComingToPickup: 'Le chauffeur se dirige vers votre point de prise en charge et l’itinéraire est en direct.',
    driverArrivedAtPickup: 'Le chauffeur est arrivé au point de prise en charge.',
    driverTakingToFinalDestination: 'Le chauffeur vous conduit maintenant vers la destination finale.',
    driverRefusedAnother: 'Le chauffeur a refusé cette demande. Choisissez un autre chauffeur disponible.',
  },
  de: {
    liveRideInProgress: 'Live-Fahrt läuft',
    passengerIsAwayEta: 'Der Fahrgast ist {distance} km entfernt · ETA {eta} Min',
    passengerLocationLive: 'Die Position des Fahrgasts ist live und wird auf der Karte aktualisiert.',
    navigateToPickup: 'Zum Abholpunkt navigieren',
    openDestinationRoute: 'Zielfahrt öffnen',
    followDestinationRoute: 'Zielfahrt verfolgen',
    arrivedAtPickup: 'Am Abholpunkt angekommen',
    startTrip: 'Fahrt starten',
    completeTrip: 'Fahrt abschließen',
    voiceGuidance: 'Sprachführung',
    availableTransportModes: 'Verfügbare Transportarten',
    pickYourLiveRideType: 'Wähle deinen Live-Fahrttyp',
    yourDriver: 'Dein Fahrer',
    vehiclePlatePending: 'Kennzeichen ausstehend',
    distanceUpdating: 'Distanz wird aktualisiert',
    etaUpdating: 'ETA wird aktualisiert',
    tripRouteLive: 'Die Route ist jetzt live auf der Karte bis zum endgültigen Ziel.',
    signInAgainToSendRequest: 'Bitte melde dich erneut an, um eine Live-Transportanfrage zu senden.',
    requestCouldNotBeCreated: 'Die Fahranfrage konnte nicht erstellt werden. Bitte erneut versuchen.',
    driverAcceptedThisRequest: 'Du hast diese Anfrage angenommen. Öffne die Karte, fahre zum Fahrgast und markiere dann die Ankunft und den Fahrtbeginn.',
    openMapToDriveToPassenger: 'Karte öffnen, um zum Fahrgast zu fahren',
    requestSentToDriver: 'Anfrage an den Fahrer gesendet. Warte auf Antwort.',
    waitingForAcceptOrRefuse: 'Warte auf Annahme oder Ablehnung',
    driverComingToPickup: 'Der Fahrer fährt zu deinem Abholpunkt und die Route ist live.',
    driverArrivedAtPickup: 'Der Fahrer ist am Abholpunkt angekommen.',
    driverTakingToFinalDestination: 'Der Fahrer bringt dich jetzt zum endgültigen Ziel.',
    driverRefusedAnother: 'Der Fahrer hat diese Anfrage abgelehnt. Wähle einen anderen verfügbaren Chauffeur.',
  },
  es: {
    liveRideInProgress: 'Viaje en vivo',
    passengerIsAwayEta: 'El pasajero está a {distance} km · ETA {eta} min',
    passengerLocationLive: 'La ubicación del pasajero está en vivo y se actualiza en el mapa.',
    navigateToPickup: 'Ir al punto de recogida',
    openDestinationRoute: 'Abrir ruta al destino',
    followDestinationRoute: 'Seguir ruta al destino',
    arrivedAtPickup: 'Llegó al punto de recogida',
    startTrip: 'Iniciar viaje',
    completeTrip: 'Completar viaje',
    voiceGuidance: 'Guía por voz',
    availableTransportModes: 'Modos de transporte disponibles',
    pickYourLiveRideType: 'Elige tu tipo de viaje en vivo',
    yourDriver: 'Tu conductor',
    vehiclePlatePending: 'Matrícula pendiente',
    distanceUpdating: 'Distancia actualizándose',
    etaUpdating: 'ETA actualizándose',
    tripRouteLive: 'La ruta del viaje está en vivo en el mapa hasta el destino final.',
    signInAgainToSendRequest: 'Vuelve a iniciar sesión para enviar una solicitud de transporte en vivo.',
    requestCouldNotBeCreated: 'No se pudo crear la solicitud de viaje. Inténtalo de nuevo.',
    driverAcceptedThisRequest: 'Aceptaste esta solicitud. Abre el mapa para ir al pasajero, luego marca la llegada y empieza el viaje.',
    openMapToDriveToPassenger: 'Abrir el mapa para ir al pasajero',
    requestSentToDriver: 'Solicitud enviada al conductor. Esperando respuesta.',
    waitingForAcceptOrRefuse: 'Esperando aceptación o rechazo',
    driverComingToPickup: 'El conductor va hacia tu punto de recogida y la ruta está en vivo.',
    driverArrivedAtPickup: 'El conductor llegó al punto de recogida.',
    driverTakingToFinalDestination: 'El conductor te lleva ahora al destino final.',
    driverRefusedAnother: 'El conductor rechazó esta solicitud. Elige otro chofer disponible.',
  },
  pt: {
    liveRideInProgress: 'Viagem ao vivo',
    passengerIsAwayEta: 'O passageiro está a {distance} km · ETA {eta} min',
    passengerLocationLive: 'A localização do passageiro está ao vivo e é atualizada no mapa.',
    navigateToPickup: 'Ir para o ponto de embarque',
    openDestinationRoute: 'Abrir rota para o destino',
    followDestinationRoute: 'Seguir rota para o destino',
    arrivedAtPickup: 'Chegou ao ponto de embarque',
    startTrip: 'Iniciar viagem',
    completeTrip: 'Concluir viagem',
    voiceGuidance: 'Orientação por voz',
    availableTransportModes: 'Modos de transporte disponíveis',
    pickYourLiveRideType: 'Escolha seu tipo de viagem ao vivo',
    yourDriver: 'Seu motorista',
    vehiclePlatePending: 'Placa pendente',
    distanceUpdating: 'Distância atualizando',
    etaUpdating: 'ETA atualizando',
    tripRouteLive: 'A rota da viagem está ao vivo no mapa até o destino final.',
    signInAgainToSendRequest: 'Entre novamente para enviar uma solicitação de transporte ao vivo.',
    requestCouldNotBeCreated: 'Não foi possível criar a solicitação de viagem. Tente novamente.',
    driverAcceptedThisRequest: 'Você aceitou esta solicitação. Abra o mapa para ir até o passageiro, depois marque a chegada e inicie a viagem.',
    openMapToDriveToPassenger: 'Abrir o mapa para ir até o passageiro',
    requestSentToDriver: 'Solicitação enviada ao motorista. Aguardando resposta.',
    waitingForAcceptOrRefuse: 'Aguardando aceitar ou recusar',
    driverComingToPickup: 'O motorista está indo até seu ponto de embarque e a rota está ao vivo.',
    driverArrivedAtPickup: 'O motorista chegou ao ponto de embarque.',
    driverTakingToFinalDestination: 'O motorista agora vai até o destino final.',
    driverRefusedAnother: 'O motorista recusou esta solicitação. Escolha outro motorista disponível.',
  },
  ar: {
    liveRideInProgress: 'الرحلة المباشرة جارية',
    passengerIsAwayEta: 'الراكب يبعد {distance} كم · الوقت المتوقع {eta} دقيقة',
    passengerLocationLive: 'موقع الراكب مباشر ويتم تحديثه على الخريطة.',
    navigateToPickup: 'الانتقال إلى نقطة الالتقاط',
    openDestinationRoute: 'فتح مسار الوجهة',
    followDestinationRoute: 'متابعة مسار الوجهة',
    arrivedAtPickup: 'وصل إلى نقطة الالتقاط',
    startTrip: 'بدء الرحلة',
    completeTrip: 'إنهاء الرحلة',
    voiceGuidance: 'توجيه صوتي',
    availableTransportModes: 'وسائل النقل المتاحة',
    pickYourLiveRideType: 'اختر نوع الرحلة المباشرة',
    yourDriver: 'سائقك',
    vehiclePlatePending: 'اللوحة قيد الانتظار',
    distanceUpdating: 'المسافة قيد التحديث',
    etaUpdating: 'الوقت المتوقع قيد التحديث',
    tripRouteLive: 'مسار الرحلة مباشر الآن على الخريطة حتى الوجهة النهائية.',
    signInAgainToSendRequest: 'سجّل الدخول مرة أخرى لإرسال طلب نقل مباشر.',
    requestCouldNotBeCreated: 'تعذر إنشاء طلب الرحلة. حاول مرة أخرى.',
    driverAcceptedThisRequest: 'لقد قبلت هذا الطلب. افتح الخريطة للتوجه إلى الراكب، ثم حدّد الوصول وابدأ الرحلة.',
    openMapToDriveToPassenger: 'افتح الخريطة للتوجه إلى الراكب',
    requestSentToDriver: 'تم إرسال الطلب إلى السائق. في انتظار الرد.',
    waitingForAcceptOrRefuse: 'في انتظار القبول أو الرفض',
    driverComingToPickup: 'السائق في طريقه إلى نقطة الالتقاط والمسار مباشر.',
    driverArrivedAtPickup: 'وصل السائق إلى نقطة الالتقاط.',
    driverTakingToFinalDestination: 'السائق ينقلك الآن إلى الوجهة النهائية.',
    driverRefusedAnother: 'رفض السائق هذا الطلب. اختر سائقًا متاحًا آخر.',
  },
  zh: {
    liveRideInProgress: '行程进行中',
    passengerIsAwayEta: '乘客距离 {distance} 公里 · 预计 {eta} 分钟',
    passengerLocationLive: '乘客位置正在实时更新到地图。',
    navigateToPickup: '导航到接人点',
    openDestinationRoute: '打开前往目的地的路线',
    followDestinationRoute: '跟随目的地路线',
    arrivedAtPickup: '已到达接人点',
    startTrip: '开始行程',
    completeTrip: '完成行程',
    voiceGuidance: '语音导航',
    availableTransportModes: '可用交通方式',
    pickYourLiveRideType: '选择你的实时行程类型',
    yourDriver: '你的司机',
    vehiclePlatePending: '车牌待定',
    distanceUpdating: '距离更新中',
    etaUpdating: '预计时间更新中',
    tripRouteLive: '行程路线已在地图上实时显示，直到最终目的地。',
    signInAgainToSendRequest: '请重新登录后再发送实时交通请求。',
    requestCouldNotBeCreated: '无法创建行程请求，请重试。',
    driverAcceptedThisRequest: '你已接受此请求。打开地图前往乘客，然后标记到达并开始行程。',
    openMapToDriveToPassenger: '打开地图前往乘客',
    requestSentToDriver: '请求已发送给司机，等待回复。',
    waitingForAcceptOrRefuse: '等待接受或拒绝',
    driverComingToPickup: '司机正前往接人点，路线为实时状态。',
    driverArrivedAtPickup: '司机已到达接人点。',
    driverTakingToFinalDestination: '司机现在正带你前往最终目的地。',
    driverRefusedAnother: '司机拒绝了此请求。请选择其他可用司机。',
  },
  ru: {
    liveRideInProgress: 'Поездка в реальном времени',
    passengerIsAwayEta: 'Пассажир в {distance} км · ETA {eta} мин',
    passengerLocationLive: 'Местоположение пассажира обновляется на карте в реальном времени.',
    navigateToPickup: 'Проложить маршрут к месту подачи',
    openDestinationRoute: 'Открыть маршрут к пункту назначения',
    followDestinationRoute: 'Следовать маршруту к пункту назначения',
    arrivedAtPickup: 'Прибыл к месту подачи',
    startTrip: 'Начать поездку',
    completeTrip: 'Завершить поездку',
    voiceGuidance: 'Голосовое сопровождение',
    availableTransportModes: 'Доступные виды транспорта',
    pickYourLiveRideType: 'Выберите тип поездки в реальном времени',
    yourDriver: 'Ваш водитель',
    vehiclePlatePending: 'Номерной знак ожидается',
    distanceUpdating: 'Расстояние обновляется',
    etaUpdating: 'ETA обновляется',
    tripRouteLive: 'Маршрут поездки теперь в реальном времени на карте до конечного пункта.',
    signInAgainToSendRequest: 'Войдите снова, чтобы отправить запрос на транспорт в реальном времени.',
    requestCouldNotBeCreated: 'Не удалось создать запрос на поездку. Попробуйте снова.',
    driverAcceptedThisRequest: 'Вы приняли этот запрос. Откройте карту, чтобы ехать к пассажиру, затем отметьте прибытие и начните поездку.',
    openMapToDriveToPassenger: 'Открыть карту, чтобы ехать к пассажиру',
    requestSentToDriver: 'Запрос отправлен водителю. Ожидаем ответа.',
    waitingForAcceptOrRefuse: 'Ожидание принятия или отказа',
    driverComingToPickup: 'Водитель едет к месту подачи, маршрут в реальном времени.',
    driverArrivedAtPickup: 'Водитель прибыл к месту подачи.',
    driverTakingToFinalDestination: 'Водитель везёт вас к конечному пункту.',
    driverRefusedAnother: 'Водитель отклонил этот запрос. Выберите другого доступного водителя.',
  },
} as const;

function journeyText(locale: Locale, key: string, values?: Record<string, string | number>) {
  const template = (J[locale] as Record<string, string>)[key] ?? (J.en as Record<string, string>)[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_, name) => String(values?.[name] ?? ''));
}

function modeFromProvider(providerType: string): ModeKey {
  const normalized = providerType.toLowerCase();
  return modeCards.find((mode) => mode.regex.test(normalized))?.key ?? 'vtc';
}

function buildDestinationOptions(match: MatchCard) {
  return [match.venue, `${match.gate} gate`, `${match.sector} sector`, `${match.city} center`].filter(
    (label, index, items) => Boolean(label) && items.indexOf(label) === index,
  );
}

function destinationLabelToQuery(match: MatchCard, label: string) {
  return `${label}, ${match.city}, ${match.country}`;
}

function rideStatusCopy(locale: Locale, status?: RideRequestView['status'] | null) {
  const meta = rideStatusStyle(status, locale);
  if (status === 'ACCEPTED') {
    return {
      badge: meta.label,
      title: journeyText(locale, 'liveRideInProgress'),
      subtitle: journeyText(locale, 'waitingForAcceptOrRefuse'),
      detail: journeyText(locale, 'driverComingToPickup'),
    };
  }
  if (status === 'ARRIVED_AT_PICKUP') {
    return {
      badge: meta.label,
      title: journeyText(locale, 'arrivedAtPickup'),
      subtitle: journeyText(locale, 'driverArrivedAtPickup'),
      detail: journeyText(locale, 'passengerLocationLive'),
    };
  }
  if (status === 'IN_PROGRESS') {
    return {
      badge: meta.label,
      title: journeyText(locale, 'tripInProgress'),
      subtitle: journeyText(locale, 'tripRouteLive'),
      detail: journeyText(locale, 'driverTakingToFinalDestination'),
    };
  }
  if (status === 'COMPLETED') {
    return {
      badge: meta.label,
      title: journeyText(locale, 'tripCompleted'),
      subtitle: journeyText(locale, 'readyForNextRequest'),
      detail: journeyText(locale, 'passengerReachedDestination'),
    };
  }
  return {
    badge: meta.label,
    title: journeyText(locale, 'liveRequestTracking'),
    subtitle: journeyText(locale, 'waitingForNextStep'),
    detail: journeyText(locale, 'acceptRideToShowRouting'),
  };
}

export function JourneyScreen({
  data,
  loading: _loading,
  locale,
  selectedMatch,
}: {
  data: LiveData | null;
  loading: boolean;
  locale: Locale;
  selectedMatch: MatchCard | null;
}) {
  const copy = getScreenCopy(locale).journey;
  const match = selectedMatch ?? data?.matches?.[0] ?? null;
  const venueCoordinateQuery = match ? `${match.venue}, ${match.city}, ${match.country}` : 'stadium';

  const [providers, setProviders] = useState<TransportProviderView[]>([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<ModeKey>('vtc');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [rideRequest, setRideRequest] = useState<RideRequestView | null>(null);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [driverRequests, setDriverRequests] = useState<RideRequestView[]>([]);
  const [driverRequestsLoading, setDriverRequestsLoading] = useState(false);
  const [driverAvailability, setDriverAvailability] = useState<TransportAvailabilityView | null>(null);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [voiceGuidanceEnabled, setVoiceGuidanceEnabled] = useState(true);
  const currentSessionUser = getSessionUser();
  const currentSessionEmail = currentSessionUser?.email ?? '';
  const currentDriverEmail = currentSessionEmail;
  const isDriver = driverAvailability?.available === true;

  const destinationOptions = useMemo(() => (match ? buildDestinationOptions(match) : []), [match]);

  useEffect(() => {
    if (!match) {
      setProviders([]);
      setSelectedDestination('');
      return;
    }
    setSelectedDestination((current) => (current && destinationOptions.includes(current) ? current : destinationOptions[0] ?? match.venue));
  }, [destinationOptions, match]);

  const reloadProviders = useMemo(() => {
    return async () => {
      if (!match) {
        setProviders([]);
        return;
      }
      setProvidersLoading(true);
      try {
        const live = await listPublicTransportProfiles(match.id);
        setProviders(live);
      } catch {
        setProviders([]);
      } finally {
        setProvidersLoading(false);
      }
    };
  }, [match]);

  useEffect(() => {
    reloadProviders();
  }, [reloadProviders]);

  useEffect(() => {
    if (!match) {
      setDriverAvailability(null);
      return;
    }

    let mounted = true;
    const refresh = async () => {
      try {
        const live = await loadTransportAvailability(match.id);
        if (!mounted) return;
        setDriverAvailability(live);
      } catch {
        if (!mounted) return;
        setDriverAvailability(null);
      }
    };

    refresh();
    const timer = setInterval(() => {
      refresh();
    }, 9000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [match]);

  useEffect(() => {
    if (!match) return;
    const timer = setInterval(() => {
      reloadProviders();
    }, 12000);
    return () => clearInterval(timer);
  }, [match, reloadProviders]);

  const availableModes = useMemo(() => {
    const counts = new Map<ModeKey, number>();
    for (const provider of providers) {
      const mode = modeFromProvider(provider.providerType);
      counts.set(mode, (counts.get(mode) ?? 0) + (provider.active || provider.ready ? 1 : 0));
    }
    return counts;
  }, [providers]);

  const driverRequestProviderTypes = useMemo(() => {
    const seen = new Set<string>();
    return providers
      .map((provider) => provider.providerType?.trim())
      .filter((providerType): providerType is string => Boolean(providerType))
      .filter((providerType) => modeFromProvider(providerType) === 'vtc' || /taxi|vtc|chauffeur|driver/i.test(providerType))
      .filter((providerType) => {
        if (seen.has(providerType)) return false;
        seen.add(providerType);
        return true;
      });
  }, [providers]);

  const filteredProviders = useMemo(
    () => providers.filter((provider) => modeFromProvider(provider.providerType) === activeMode),
    [providers, activeMode],
  );

  useEffect(() => {
    if (!match || !isDriver) {
      setDriverRequests([]);
      return;
    }
    let cancelled = false;
    const refresh = async () => {
      setDriverRequestsLoading(true);
      try {
        const providerTypes = driverRequestProviderTypes.length ? driverRequestProviderTypes : ['Taxi', 'VTC'];
        const [pendingBatches, assigned] = await Promise.all([
          Promise.all(providerTypes.map((providerType) => listDriverRideRequests(match.id, providerType).catch(() => []))),
          currentSessionEmail ? listAssignedDriverRideRequests(currentSessionEmail) : Promise.resolve([]),
        ]);
        if (!cancelled) {
          const pending = pendingBatches.flat();
          const live = [...pending, ...assigned.filter((request) => request.matchId === match.id)];
          const deduped = live.filter((request, index, list) => list.findIndex((item) => item.id === request.id) === index);
          setDriverRequests(deduped);
        }
      } catch {
        if (!cancelled) {
          setDriverRequests([]);
        }
      } finally {
        if (!cancelled) {
          setDriverRequestsLoading(false);
        }
      }
    };
    refresh();
    const timer = setInterval(() => {
      refresh();
    }, 6000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [match, isDriver, currentSessionEmail, driverRequestProviderTypes]);

  useEffect(() => {
    if (!currentSessionEmail) return;
    let cancelled = false;
    const refresh = async () => {
      try {
        const live = await listPassengerRideRequests(currentSessionEmail);
        if (cancelled) return;
        const activeRequest = live.find((request) => request.status !== 'COMPLETED' && request.status !== 'REFUSED') ?? live[0] ?? null;
        if (activeRequest) {
          setRideRequest(activeRequest);
          if (activeRequest.status === 'ACCEPTED') {
            setStatusMessage(`${activeRequest.driverDisplayName ?? journeyText(locale, 'yourDriver')} · ${journeyText(locale, 'driverComingToPickup')}`);
          } else if (activeRequest.status === 'ARRIVED_AT_PICKUP') {
            setStatusMessage(`${activeRequest.driverDisplayName ?? journeyText(locale, 'yourDriver')} · ${journeyText(locale, 'driverArrivedAtPickup')}`);
          } else if (activeRequest.status === 'IN_PROGRESS') {
            setStatusMessage(`${activeRequest.driverDisplayName ?? journeyText(locale, 'yourDriver')} · ${journeyText(locale, 'driverTakingToFinalDestination')}`);
          }
        }
      } catch {
        if (cancelled) return;
      }
    };
    refresh();
    const timer = setInterval(() => {
      refresh();
    }, 7000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [currentSessionEmail, locale]);

  useEffect(() => {
    if (!rideRequest) return;
    const timer = setInterval(async () => {
      try {
        const current = await getRideRequest(rideRequest.id);
        setRideRequest(current);
        if (current.status === 'ACCEPTED') {
          setStatusMessage(`${current.driverDisplayName ?? journeyText(locale, 'yourDriver')} · ${journeyText(locale, 'driverComingToPickup')}`);
        } else if (current.status === 'REFUSED') {
          setStatusMessage(journeyText(locale, 'driverRefusedAnother'));
        }
      } catch {
        // keep last state
      }
    }, 3500);
    return () => clearInterval(timer);
  }, [rideRequest, locale]);

  const reserveRide = async (provider: TransportProviderView) => {
    if (!match) return;
    setRequestLoading(true);
    setRequestError(null);
    try {
      const me = getSessionUser();
      const hasToken = Boolean(getAuthToken());
      const wantsLiveBooking = provider.providerType.toLowerCase().includes('taxi') || provider.providerType.toLowerCase().includes('vtc');
      if (!wantsLiveBooking) {
        const walkingQuery = destinationLabelToQuery(match, selectedDestination || match.venue);
        setStatusMessage(`${provider.displayName} opens the walking route in maps.`);
        await Linking.openURL(googleMapsDirectionsUrl(walkingQuery));
        return;
      }
      if (!me?.email && !hasToken) {
        setRequestError(journeyText(locale, 'signInAgainToSendRequest'));
        setRequestLoading(false);
        return;
      }
      const request = await createRideRequest({
        matchId: match.id,
        matchTitle: `${match.homeTeam} vs ${match.awayTeam}`,
        passengerEmail: me?.email,
        passengerName: me?.fullName,
        providerType: provider.providerType,
        pickupLabel: `${match.city} live pickup`,
        destinationLabel: selectedDestination || match.venue,
        note: `Live ride request for ${provider.displayName}`,
      });
      setRideRequest(request);
      setStatusMessage(`${provider.displayName} · ${journeyText(locale, 'requestSentToDriver')}`);
    } catch {
      setRequestError(journeyText(locale, 'requestCouldNotBeCreated'));
    } finally {
      setRequestLoading(false);
    }
  };

  useEffect(() => {
    loadVoiceGuidanceEnabled().then((enabled) => setVoiceGuidanceEnabled(enabled));
  }, []);

  const requestSummary = rideRequest
    ? `${rideRequest.providerType} · ${rideRequest.status} · ${rideRequest.pickupLabel} → ${rideRequest.destinationLabel}`
    : null;
  const visibleDriverRequests = driverRequests.filter((request) => request.status !== 'ACCEPTED' || request.driverProfileId === currentDriverEmail);
  const activeDriverRequest = visibleDriverRequests.find((request) => request.status === 'ACCEPTED' && request.driverProfileId === currentDriverEmail) ?? null;
  const activeDriverStatusMeta = rideStatusStyle(activeDriverRequest?.status, locale);
  const activeDriverStatus = rideStatusCopy(locale, activeDriverRequest?.status);
  const activeDriverNavigationLabel = activeDriverRequest
    ? activeDriverRequest.status === 'ACCEPTED'
      ? journeyText(locale, 'navigateToPickup')
      : activeDriverRequest.status === 'ARRIVED_AT_PICKUP'
        ? journeyText(locale, 'openDestinationRoute')
        : activeDriverRequest.status === 'IN_PROGRESS'
          ? journeyText(locale, 'followDestinationRoute')
          : null
    : null;
  const announceNavigationSummary = () => {
    if (!voiceGuidanceEnabled) {
      stopVoiceGuidance();
      return;
    }
    const parts = [
      activeDriverRequest ? activeDriverStatus.detail : null,
      activeDriverRequest?.passengerName,
      activeDriverRequest?.pickupLabel,
      activeDriverRequest?.destinationLabel,
      activeDriverRequest?.driverDistanceKm != null ? `${activeDriverRequest.driverDistanceKm} km` : null,
      activeDriverRequest?.driverEtaMinutes != null ? `${activeDriverRequest.driverEtaMinutes} min` : null,
    ].filter((part): part is string => Boolean(part));
    if (parts.length) {
      const summary = parts.join(' · ');
      AccessibilityInfo.announceForAccessibility(summary);
      speakVoiceGuidance(summary, locale);
    }
  };

  const toggleVoiceGuidance = async () => {
    const next = !voiceGuidanceEnabled;
    setVoiceGuidanceEnabled(next);
    await saveVoiceGuidanceEnabled(next);
    if (!next) {
      stopVoiceGuidance();
      return;
    }
    announceNavigationSummary();
  };
  const activeDriverRoute = buildRideRouteCoordinates(
    activeDriverRequest?.driverLatitude != null && activeDriverRequest?.driverLongitude != null
      ? { latitude: activeDriverRequest.driverLatitude, longitude: activeDriverRequest.driverLongitude }
      : null,
    activeDriverRequest?.pickupLatitude != null && activeDriverRequest?.pickupLongitude != null
      ? { latitude: activeDriverRequest.pickupLatitude, longitude: activeDriverRequest.pickupLongitude }
      : null,
    activeDriverRequest?.status === 'IN_PROGRESS' && activeDriverRequest.destinationLatitude != null && activeDriverRequest.destinationLongitude != null
      ? { latitude: activeDriverRequest.destinationLatitude, longitude: activeDriverRequest.destinationLongitude }
      : null,
  );
  const passengerStatusMeta = rideStatusStyle(rideRequest?.status, locale);
  const passengerStatus = rideStatusCopy(locale, rideRequest?.status);
  const passengerRoute = buildRideRouteCoordinates(
    rideRequest?.driverLatitude != null && rideRequest?.driverLongitude != null
      ? { latitude: rideRequest.driverLatitude, longitude: rideRequest.driverLongitude }
      : null,
    rideRequest?.pickupLatitude != null && rideRequest?.pickupLongitude != null
      ? { latitude: rideRequest.pickupLatitude, longitude: rideRequest.pickupLongitude }
      : null,
    rideRequest?.status === 'IN_PROGRESS' && rideRequest.destinationLatitude != null && rideRequest.destinationLongitude != null
      ? { latitude: rideRequest.destinationLatitude, longitude: rideRequest.destinationLongitude }
      : null,
  );

  if (!match) {
    return (
      <View style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Card title={copy.title} subtitle={copy.subtitle} wide>
            <EmptyState icon="calendar-outline" title={t(locale, 'common.noMatchSelected')} subtitle={t(locale, 'common.selectMatchFirstBody')} />
          </Card>
        </ScrollView>
      </View>
    );
  }

  const mapQuery = selectedDestination ? destinationLabelToQuery(match, selectedDestination) : venueCoordinateQuery;

  if (isDriver) {
    return (
      <View style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.heroRow}>
            <View style={[styles.card, styles.cardWide]}>
              <Text style={styles.kicker}>{t(locale, 'journey.title')}</Text>
              <Text style={styles.title}>{match.homeTeam} vs {match.awayTeam}</Text>
              <Text style={styles.subtitle}>{match.venue} · {match.city}</Text>
              <Text style={styles.muted}>{t(locale, 'common.liveTracking')}</Text>
            </View>
          </View>

          <Card title={t(locale, 'common.passengerRequests')} subtitle={t(locale, 'common.driverRequestsSubtitle')}>
            {driverRequestsLoading ? (
              <Text style={styles.muted}>{t(locale, 'common.loading')}</Text>
            ) : visibleDriverRequests.length ? (
              <View style={styles.cardBody}>
                {activeDriverRequest ? (
                  <View style={styles.miniCard}>
                    <View style={styles.rowBetween}>
                      <View style={styles.rowLeft}>
                        <Text style={styles.cardTitle} numberOfLines={2} ellipsizeMode="tail">{journeyText(locale, 'liveRideInProgress')}</Text>
                        <Text style={styles.muted}>{activeDriverRequest.passengerName}</Text>
                      </View>
                      <Pill subtle>{activeDriverStatus.badge}</Pill>
                    </View>
                    <Text style={styles.muted}>{activeDriverRequest.pickupLabel}</Text>
                    <Text style={styles.miniCardMeta}>{activeDriverRequest.destinationLabel}</Text>
                    <Text style={styles.helperText}>
                    {activeDriverRequest.driverDistanceKm != null || activeDriverRequest.driverEtaMinutes != null
                      ? journeyText(locale, 'passengerIsAwayEta', { distance: activeDriverRequest.driverDistanceKm ?? '?', eta: activeDriverRequest.driverEtaMinutes ?? '?' })
                      : journeyText(locale, 'passengerLocationLive')}
                    </Text>
                    {activeDriverNavigationLabel ? (
                      <View style={styles.ctaRow}>
                        <SecondaryButton
                          label={activeDriverNavigationLabel}
                          onPress={() =>
                            openGoogleMapsDirections(
                              activeDriverRequest.status === 'ACCEPTED' || activeDriverRequest.status === 'ARRIVED_AT_PICKUP'
                                ? destinationLabelToQuery(match, activeDriverRequest.pickupLabel)
                                : destinationLabelToQuery(match, activeDriverRequest.destinationLabel),
                            )
                          }
                          icon={<Feather name="navigation" size={16} color="#22d3ee" />}
                        />
                      </View>
                    ) : null}
                    <View style={styles.ctaRow}>
                      <SecondaryButton label={journeyText(locale, 'arrivedAtPickup')} onPress={() => markRideRequestArrived(activeDriverRequest.id)} icon={<Ionicons name="location-outline" size={16} color="#22d3ee" />} />
                      <PrimaryButton label={journeyText(locale, 'startTrip')} onPress={() => startRideRequestTrip(activeDriverRequest.id)} icon={<Ionicons name="navigate-outline" size={16} color="#f8fafc" />} />
                      <SecondaryButton label={journeyText(locale, 'completeTrip')} onPress={() => completeRideRequestTrip(activeDriverRequest.id)} icon={<Ionicons name="checkmark-done-outline" size={16} color="#22d3ee" />} />
                                            <SecondaryButton
                        label={journeyText(locale, 'voiceGuidance')}
                        onPress={() => toggleVoiceGuidance()}
                        icon={<Ionicons name={voiceGuidanceEnabled ? 'volume-high-outline' : 'volume-mute-outline'} size={16} color="#22d3ee" />}
                      />
                    </View>
                  </View>
                ) : null}
                {visibleDriverRequests.map((request) => {
                  const isOwnAccepted = request.status === 'ACCEPTED' && request.driverProfileId === currentDriverEmail;
                  return (
                    <View key={request.id} style={styles.miniCard}>
                      <Text style={styles.miniCardTitle}>{request.passengerName}</Text>
                      <Text style={styles.muted}>{request.pickupLabel}</Text>
                      <Text style={styles.miniCardMeta}>{request.destinationLabel}</Text>
                      <Text style={styles.muted}>{rideStatusCopy(locale, request.status).badge}</Text>
                      {isOwnAccepted ? (
                        <Text style={styles.helperText}>{journeyText(locale, 'driverAcceptedThisRequest')}</Text>
                      ) : null}
                      <View style={styles.ctaRow}>
                        {request.status === 'PENDING' ? (
                          <>
                            <SecondaryButton
                              label={t(locale, 'common.refuse')}
                              onPress={() => {
                                refuseRideRequest(request.id);
                              }}
                            />
                            <PrimaryButton
                              label={t(locale, 'common.accept')}
                              onPress={() => {
                                acceptRideRequest(request.id).then((accepted) => {
                                  setDriverRequests((current) => current.map((item) => (item.id === accepted.id ? accepted : item)));
                                  setStatusMessage(
                                    `${accepted.passengerName}${accepted.driverDistanceKm != null ? ` · ${accepted.driverDistanceKm} km` : ''}${accepted.driverEtaMinutes != null ? ` · ${accepted.driverEtaMinutes} min` : ''}`,
                                  );
                                });
                              }}
                              icon={<Ionicons name="checkmark" size={16} color="#f8fafc" />}
                            />
                          </>
                        ) : isOwnAccepted ? (
                          <SecondaryButton
                            label={t(locale, 'common.openInGoogleMaps')}
                            onPress={() => openGoogleMapsDirections(destinationLabelToQuery(match, request.pickupLabel))}
                            icon={<Feather name="map" size={16} color="#22d3ee" />}
                          />
                        ) : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <EmptyState icon="car-sport-outline" title={t(locale, 'common.noLiveReservation')} subtitle={t(locale, 'common.driverRequestsSubtitle')} />
            )}
          </Card>

          <View style={styles.card}>
            <View style={styles.mapPanel}>
              <MapboxNaviView
              height={420}
              origin={{ latitude: 40.4531, longitude: -3.6883 }}
              destination={
                activeDriverRequest?.status === 'IN_PROGRESS' && activeDriverRequest.destinationLatitude != null && activeDriverRequest.destinationLongitude != null
                  ? { latitude: activeDriverRequest.destinationLatitude, longitude: activeDriverRequest.destinationLongitude }
                  : activeDriverRequest?.pickupLatitude != null && activeDriverRequest?.pickupLongitude != null
                    ? { latitude: activeDriverRequest.pickupLatitude, longitude: activeDriverRequest.pickupLongitude }
                    : { latitude: 40.4531, longitude: -3.6883 }
              }
              route={activeDriverRoute}
              title={activeDriverStatus.title}
              subtitle={activeDriverStatus.subtitle}
              liveLabel={activeDriverStatus.badge}
            />
              <Pressable onPress={() => setMapExpanded(true)} style={floatingExpandButtonStyle}>
                <Feather name="maximize-2" size={16} color="#fff" />
              </Pressable>
              <View style={styles.mapOverlay}>
                <View style={styles.rowBetween}>
                  <View style={styles.rowLeft}>
                    <Text style={styles.cardTitle} numberOfLines={2} ellipsizeMode="tail">{activeDriverStatus.title}</Text>
                    <Text style={styles.muted}>{activeDriverStatus.subtitle}</Text>
                  </View>
                  <View style={[statusBadgeStyle, { backgroundColor: activeDriverStatusMeta.backgroundColor }]}>
                    <Text style={[statusTextStyle, { color: activeDriverStatusMeta.color }]}>{activeDriverStatus.badge}</Text>
                  </View>
                </View>
                <Text style={styles.helperText}>{activeDriverStatus.detail}</Text>
                {activeDriverNavigationLabel ? (
                  <View style={styles.ctaRow}>
                    <SecondaryButton
                      label={activeDriverNavigationLabel}
                      onPress={() =>
                        openGoogleMapsDirections(
                          activeDriverRequest?.status === 'ACCEPTED' || activeDriverRequest?.status === 'ARRIVED_AT_PICKUP'
                            ? destinationLabelToQuery(match, activeDriverRequest.pickupLabel)
                            : destinationLabelToQuery(match, activeDriverRequest?.destinationLabel || selectedDestination || match.venue),
                        )
                      }
                      icon={<Feather name="navigation" size={16} color="#22d3ee" />}
                    />
                  </View>
                ) : null}
                {activeDriverRequest ? (
                  <Text style={styles.helperText}>
                    {activeDriverRequest.passengerName} · {activeDriverRequest.pickupLabel} · {activeDriverRequest.destinationLabel}
                  </Text>
                ) : null}
                {activeDriverRequest?.driverDistanceKm != null || activeDriverRequest?.driverEtaMinutes != null ? (
                  <Text style={styles.helperText}>
                    {activeDriverRequest.driverDistanceKm != null ? `${activeDriverRequest.driverDistanceKm} km` : journeyText(locale, 'distanceUpdating')} · {activeDriverRequest.driverEtaMinutes != null ? `${activeDriverRequest.driverEtaMinutes} min` : journeyText(locale, 'etaUpdating')}
                  </Text>
                ) : null}
              </View>
            </View>
            <Text style={styles.muted}>{t(locale, 'common.pickupTracking')}</Text>
          </View>

          <Modal visible={mapExpanded} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setMapExpanded(false)}>
            <SafeAreaView style={styles.safeArea}>
              <View style={[styles.container, compactPageStyle]}> 
                <View style={[styles.header, compactHeaderStyle]}> 
                  <View style={styles.rowBetween}>
                    <View style={styles.rowLeft}>
                      <Text style={styles.kicker}>{t(locale, 'common.liveMap')}</Text>
                      <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">{activeDriverStatus.title}</Text>
                      <Text style={styles.subtitle}>{activeDriverStatus.subtitle}</Text>
                    </View>
                    <SecondaryButton label={t(locale, 'common.refuse')} onPress={() => setMapExpanded(false)} icon={<Feather name="x" size={16} color="#22d3ee" />} />
                  </View>
                </View>
                <View style={[styles.mapPanel, expandedMapStyle]}> 
                  <MapboxNaviView
                    height={700}
                    origin={{ latitude: 40.4531, longitude: -3.6883 }}
                    destination={
                      activeDriverRequest?.status === 'IN_PROGRESS' && activeDriverRequest.destinationLatitude != null && activeDriverRequest.destinationLongitude != null
                        ? { latitude: activeDriverRequest.destinationLatitude, longitude: activeDriverRequest.destinationLongitude }
                        : activeDriverRequest?.pickupLatitude != null && activeDriverRequest?.pickupLongitude != null
                          ? { latitude: activeDriverRequest.pickupLatitude, longitude: activeDriverRequest.pickupLongitude }
                          : { latitude: 40.4531, longitude: -3.6883 }
                    }
                    route={activeDriverRoute}
                    title={activeDriverStatus.title}
                    subtitle={activeDriverStatus.subtitle}
                    liveLabel={activeDriverStatus.badge}
                  />
                  <View style={styles.mapOverlay}>
                    <View style={styles.rowBetween}>
                      <View style={styles.rowLeft}>
                        <Text style={styles.cardTitle} numberOfLines={2} ellipsizeMode="tail">{activeDriverStatus.title}</Text>
                        <Text style={styles.muted}>{activeDriverStatus.subtitle}</Text>
                      </View>
                      <View style={[statusBadgeStyle, { backgroundColor: activeDriverStatusMeta.backgroundColor }]}>
                        <Text style={[statusTextStyle, { color: activeDriverStatusMeta.color }]}>{activeDriverStatus.badge}</Text>
                      </View>
                    </View>
                    <Text style={styles.helperText}>{activeDriverStatus.detail}</Text>
                    {activeDriverNavigationLabel ? (
                      <View style={styles.ctaRow}>
                        <SecondaryButton
                          label={activeDriverNavigationLabel}
                          onPress={() =>
                            openGoogleMapsDirections(
                              activeDriverRequest?.status === 'ACCEPTED' || activeDriverRequest?.status === 'ARRIVED_AT_PICKUP'
                                ? destinationLabelToQuery(match, activeDriverRequest.pickupLabel)
                                : destinationLabelToQuery(match, activeDriverRequest?.destinationLabel || selectedDestination || match.venue),
                            )
                          }
                          icon={<Feather name="navigation" size={16} color="#22d3ee" />}
                        />
                                              <SecondaryButton
                        label={journeyText(locale, 'voiceGuidance')}
                        onPress={() => toggleVoiceGuidance()}
                        icon={<Ionicons name={voiceGuidanceEnabled ? 'volume-high-outline' : 'volume-mute-outline'} size={16} color="#22d3ee" />}
                      />
                      </View>
                    ) : null}
                  </View>
                </View>
              </View>
            </SafeAreaView>
          </Modal>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>{copy.eyebrow}</Text>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.subtitle}>{match.homeTeam} vs {match.awayTeam}</Text>
        </View>

        <Card title={t(locale, 'common.liveMap')} subtitle={t(locale, 'common.pickupTracking')} wide>
          <View style={styles.mapPanel}>
            <MapboxNaviView
              height={420}
              origin={{ latitude: 40.4531, longitude: -3.6883 }}
              destination={
                rideRequest?.status === 'IN_PROGRESS' && rideRequest.destinationLatitude != null && rideRequest.destinationLongitude != null
                  ? { latitude: rideRequest.destinationLatitude, longitude: rideRequest.destinationLongitude }
                  : rideRequest?.pickupLatitude != null && rideRequest?.pickupLongitude != null
                    ? { latitude: rideRequest.pickupLatitude, longitude: rideRequest.pickupLongitude }
                    : { latitude: 40.4531, longitude: -3.6883 }
              }
              route={passengerRoute}
              title={passengerStatus.title}
              subtitle={passengerStatus.subtitle}
              liveLabel={passengerStatus.badge}
            />
            <View style={styles.mapOverlay}>
              <View style={styles.rowBetween}>
                <View style={styles.rowLeft}>
                  <Text style={styles.cardTitle} numberOfLines={2} ellipsizeMode="tail">{passengerStatus.title}</Text>
                  <Text style={styles.muted}>{passengerStatus.subtitle}</Text>
                </View>
                <View style={[statusBadgeStyle, { backgroundColor: passengerStatusMeta.backgroundColor }]}>
                  <Text style={[statusTextStyle, { color: passengerStatusMeta.color }]}>{passengerStatus.badge}</Text>
                </View>
              </View>
              <Text style={styles.helperText}>{passengerStatus.detail}</Text>
              <Text style={styles.helperText}>
                {rideRequest?.driverDisplayName || journeyText(locale, 'yourDriver')}
                {rideRequest?.driverVehiclePlate ? ` · ${rideRequest.driverVehiclePlate}` : ''}
                {rideRequest?.driverDistanceKm != null ? ` · ${rideRequest.driverDistanceKm} km` : ` · ${journeyText(locale, 'distanceUpdating')}`}
                {rideRequest?.driverEtaMinutes != null ? ` · ${rideRequest.driverEtaMinutes} min` : ` · ${journeyText(locale, 'etaUpdating')}`}
              </Text>
              {rideRequest?.status === 'IN_PROGRESS' ? (
                <Text style={styles.helperText}>{journeyText(locale, 'tripRouteLive')}</Text>
              ) : null}
              {statusMessage ? <Text style={styles.helperText}>{statusMessage}</Text> : null}
              <View style={styles.ctaRow}>
                <SecondaryButton label={t(locale, 'common.openInGoogleMaps')} onPress={() => openGoogleMapsDirections(mapQuery)} icon={<Feather name="map" size={16} color="#22d3ee" />} />
              </View>
            </View>
          </View>
        </Card>

        <Card title={journeyText(locale, 'availableTransportModes')} subtitle={journeyText(locale, 'pickYourLiveRideType')} wide>
          <View style={styles.chipsRow}>
            {modeCards.map((mode) => (
              <Pressable
                key={mode.key}
                onPress={() => setActiveMode(mode.key)}
                style={[styles.tabChip, activeMode === mode.key && styles.tabChipActive]}
              >
                <View style={styles.buttonContent}>
                  <View style={styles.buttonIcon}>{mode.icon}</View>
                  <Text style={[styles.tabChipText, activeMode === mode.key && styles.tabChipTextActive]}>{mode.label}</Text>
                </View>
                <Text style={styles.helperText}>{availableModes.get(mode.key) ?? 0} {t(locale, 'common.available')} · {mode.subtitle}</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card title={t(locale, 'common.destination')} subtitle={t(locale, 'common.chooseFinalDestination')} wide>
          <View style={styles.chipsRow}>
            {destinationOptions.map((option) => (
              <Pressable
                key={option}
                onPress={() => setSelectedDestination(option)}
                style={[styles.tabChip, selectedDestination === option && styles.tabChipActive]}
              >
                <Text style={styles.tabChipText}>{option}</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card title={t(locale, 'common.availableChauffeurs')} subtitle={t(locale, 'common.instantBooking')} wide>
          {providersLoading ? (
            <EmptyState icon="loader-outline" title={t(locale, 'common.loading')} subtitle={t(locale, 'common.loading')} />
          ) : filteredProviders.length ? (
            <View style={styles.cardBody}>
              {filteredProviders.map((provider) => {
                const isReady = provider.active || provider.ready;
                return (
                  <View key={provider.id} style={styles.miniCard}>
                    <View style={styles.rowBetween}>
                      <View style={styles.rowLeft}>
                        <Text style={styles.cardTitle} numberOfLines={2} ellipsizeMode="tail">{provider.displayName}</Text>
                        <Text style={styles.muted}>{provider.driverName} · {provider.vehicleLabel}</Text>
                      </View>
                      <Pill subtle={isReady}>{isReady ? t(locale, 'common.available') : t(locale, 'common.notAvailable')}</Pill>
                    </View>
                    <Text style={styles.muted}>{provider.vehiclePlate} · {provider.city}, {provider.country}</Text>
                    {provider.publicNotes ? <Text style={styles.helperText}>{provider.publicNotes}</Text> : null}
                    <View style={styles.ctaRow}>
                      <PrimaryButton
                        label={provider.providerType.toLowerCase().includes('taxi') || provider.providerType.toLowerCase().includes('vtc')
                          ? t(locale, 'common.sendRequest')
                          : t(locale, 'common.navigate')}
                        onPress={() => reserveRide(provider)}
                        icon={<Ionicons name="car-outline" size={16} color="#f8fafc" />}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <EmptyState icon="car-outline" title={t(locale, 'common.noProviders')} subtitle={t(locale, 'common.changeEvent')} />
          )}
        </Card>

        <Card title={t(locale, 'common.liveRiderTracking')} subtitle={t(locale, 'common.liveTracking')} wide>
          {rideRequest ? (
            <View style={styles.cardBody}>
              <View style={styles.rowBetween}>
                <View style={styles.rowLeft}>
                  <Text style={styles.cardTitle} numberOfLines={2} ellipsizeMode="tail">{passengerStatus.badge}</Text>
                  <Text style={styles.muted}>{requestSummary}</Text>
                </View>
                <Pill subtle={rideRequest.status === 'ACCEPTED'}>{passengerStatus.badge}</Pill>
              </View>
              <Text style={styles.helperText}>
                {rideRequest.status === 'PENDING'
                  ? journeyText(locale, 'requestSentToDriver')
                  : rideRequest.status === 'ACCEPTED'
                    ? journeyText(locale, 'driverComingToPickup')
                    : rideRequest.status === 'ARRIVED_AT_PICKUP'
                      ? journeyText(locale, 'driverArrivedAtPickup')
                      : rideRequest.status === 'IN_PROGRESS'
                        ? journeyText(locale, 'driverTakingToFinalDestination')
                        : journeyText(locale, 'driverRefusedAnother')}
              </Text>
              {rideRequest.status === 'ACCEPTED' || rideRequest.status === 'ARRIVED_AT_PICKUP' || rideRequest.status === 'IN_PROGRESS' ? (
                <Text style={styles.helperText}>
                  {rideRequest.driverDisplayName || journeyText(locale, 'yourDriver')} · {rideRequest.driverVehiclePlate || journeyText(locale, 'vehiclePlatePending')} · {rideRequest.driverDistanceKm != null ? `${rideRequest.driverDistanceKm} km` : journeyText(locale, 'distanceUpdating')} · {rideRequest.driverEtaMinutes != null ? `${rideRequest.driverEtaMinutes} min` : journeyText(locale, 'etaUpdating')}
                </Text>
              ) : null}
              {statusMessage ? <Text style={styles.helperText}>{statusMessage}</Text> : null}
              <View style={styles.ctaRow}>
                <SecondaryButton label={t(locale, 'common.openInGoogleMaps')} onPress={() => openGoogleMapsDirections(mapQuery)} icon={<Feather name="map" size={16} color="#22d3ee" />} />
              </View>
            </View>
          ) : (
            <EmptyState icon="radio-outline" title={t(locale, 'common.noLiveReservation')} subtitle={t(locale, 'common.liveTracking')} />
          )}
          {requestError ? <Text style={styles.errorText}>{requestError}</Text> : null}
          {requestLoading ? <Text style={styles.helperText}>{t(locale, 'common.loading')}</Text> : null}
        </Card>
      </ScrollView>
    </View>
  );
}
