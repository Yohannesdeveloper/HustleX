/**
 * React Native MessagesTab Component
 * Complete conversion maintaining exact UI/UX and functionality
 * Streamlined messaging interface with real-time updates
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Dimensions,
  Alert,
  Modal,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAppSelector } from "../store/hooks";
import { useAuth } from "../store/hooks";
import { useWebSocket } from "../context/WebSocketContext-react-native";
import apiService from "../services/api-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import EmojiSelector from "react-native-emoji-selector";
import * as Clipboard from 'expo-clipboard';

interface Conversation {
  id: string;
  freelancerId: string;
  freelancerName: string;
  freelancerEmail: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

const getNormalizedConversationKey = (userId: string, otherId: string) =>
  `conversation_${[userId, otherId].sort().join("_")}`;

// Device detection utilities
const getDeviceInfo = () => {
  const { width, height } = Dimensions.get('window');
  const screenData = Dimensions.get('screen');

  // Calculate device type based on screen dimensions
  const isTablet = width >= 768 || (width >= 600 && height >= 600);
  const isSmallDevice = width < 375; // iPhone SE, small Android phones
  const isLargeDevice = width >= 414; // iPhone Plus, large Android phones

  // Calculate device orientation
  const isLandscape = width > height;

  return {
    width,
    height,
    screenWidth: screenData.width,
    screenHeight: screenData.height,
    isTablet,
    isSmallDevice,
    isLargeDevice,
    isLandscape,
    platform: Platform.OS,
    isIOS: Platform.OS === 'ios',
    isAndroid: Platform.OS === 'android',
  };
};

// Comprehensive emoji categories with names
const EMOJI_CATEGORIES = [
  {
    name: 'Smileys & People',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠'],
  },
  {
    name: 'People & Body',
    emojis: ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '👶', '👧', '🧒', '👦', '👩', '🧑', '👨', '👵', '🧓', '👴', '👲', '👳', '🧕', '👮', '👷', '💂', '🕵️', '👰', '🤵', '👸', '🤴', '🤶', '🎅', '🧙', '🧚', '🧛', '🧜', '🧝', '🧞', '🧟', '💆', '💇', '🚶', '🏃', '💃', '🕺', '🕴', '👯', '🧘', '🧗', '🤺', '🏇', '⛷️', '🏂', '🏌️', '🏄', '🚣', '🏊', '⛹️', '🏋️', '🚴', '🚵', '🤸', '🤼', '🤽', '🤾', '🤹', '🛀', '🛌'],
  },
  {
    name: 'Animals & Nature',
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🦡', '🐾', '🐉', '🐲', '🌵', '🎄', '🌲', '🌳', '🌴', '🌱', '🌿', '☘️', '🍀', '🎍', '🎋', '🍃', '🍂', '🍁', '🍄', '🌾', '💐', '🌷', '🌹', '🥀', '🌺', '🌸', '🌼', '🌻', '🌞', '🌝', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌙', '🌎', '🌍', '🌏', '💫', '⭐', '🌟', '✨', '⚡', '☄️', '💥', '🔥', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '☔', '❄️', '☃️', '⛄', '🌬️', '💨', '💧', '💦', '☂️', '🌊', '🌫️'],
  },
  {
    name: 'Food & Drink',
    emojis: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🌽', '🥕', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🥞', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🌮', '🌯', '🥗', '🥘', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '☕', '🍵', '🥤', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🍾', '🥄', '🍴', '🍽️', '🥢', '🥣', '🥡'],
  },
  {
    name: 'Travel & Places',
    emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🛴', '🚲', '🛵', '🏍️', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩️', '💺', '🚁', '🛰️', '🚀', '🛸', '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚢', '⚓', '⛽', '🚧', '🚦', '🚥', '🗺️', '🗿', '🗽', '🗼', '🏰', '🏯', '🏟️', '🎡', '🎢', '🎠', '⛲', '⛱️', '🏖️', '🏝️', '🏜️', '🌋', '⛰️', '🏔️', '🗻', '🏕️', '⛺', '🏠', '🏡', '🏘️', '🏚️', '🏗️', '🏭', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏩', '💒', '🏛️', '⛪', '🕌', '🕍', '🕋', '⛩️', '🛤️', '🛣️', '🗾', '🎑', '🏞️', '🌅', '🌄', '🌠', '🎇', '🎆', '🌇', '🌆', '🏙️', '🌃', '🌌', '🌉', '🌁'],
  },
  {
    name: 'Activities',
    emojis: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥅', '🏒', '🏑', '🏏', '🥍', '🏹', '🎣', '🥊', '🥋', '🎽', '⛸️', '🥌', '🛷', '🎿', '⛷️', '🏂', '🏋️', '🤼', '🤸', '🤺', '⛹️', '🤹', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚵', '🚴', '🏇', '🛶', '🎪', '🎭', '🩰', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩'],
  },
  {
    name: 'Objects',
    emojis: ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '💰', '💳', '💎', '⚖️', '🛠️', '🔨', '⚒️', '🔧', '🔩', '⚙️', '🗜️', '⛏️', '🔫', '💣', '🧨', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳️', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡️', '🧹', '🧺', '🧻', '🚽', '🚿', '🛁', '🛀', '🧼', '🧽', '🧴', '🛎️', '🔑', '🗝️', '🚪', '🪑', '🛋️', '🛏️', '🛌', '🧸', '🖼️', '🛍️', '🛒', '🎁', '🎈', '🎏', '🎀', '🎊', '🎉', '🎎', '🏮', '🎐', '🧧', '✉️', '📩', '📨', '📧', '💌', '📥', '📤', '📦', '🏷️', '📪', '📫', '📬', '📭', '📮', '📯', '📜', '📃', '📄', '📑', '📊', '📈', '📉', '🗒️', '🗓️', '📆', '📅', '🗑️', '📇', '🗃️', '🗳️', '🗄️', '📋', '📁', '📂', '🗂️', '🗞️', '📰', '📓', '📔', '📒', '📕', '📗', '📘', '📙', '📚', '📖', '🔖', '🧷', '🔗', '📎', '🖇️', '📐', '📏', '🧮', '📌', '📍', '✂️', '🖊️', '🖋️', '✒️', '🖌️', '🖍️', '📝', '✏️', '🔍', '🔎', '🔏', '🔐', '🔒', '🔓'],
  },
  {
    name: 'Symbols',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🔢', '🔟', '#️⃣', '*️⃣', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔺', '🔻', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪️', '▫️', '◾', '◽', '◼️', '◻️', '⬛', '⬜', '🔈', '🔇', '🔉', '🔊', '🔔', '🔕', '📣', '📢', '👁️‍🗨️', '💬', '💭', '🗯️', '♠️', '♣️', '♥️', '♦️', '🃏', '🎴', '🀄'],
  },
  {
    name: 'Flags',
    emojis: ['🏳️', '🏴', '🏁', '🚩', '🏳️‍🌈', '🏳️‍⚧️', '🇦🇨', '🇦🇩', '🇦🇪', '🇦🇫', '🇦🇬', '🇦🇮', '🇦🇱', '🇦🇲', '🇦🇴', '🇦🇶', '🇦🇷', '🇦🇸', '🇦🇹', '🇦🇺', '🇦🇼', '🇦🇽', '🇦🇿', '🇧🇦', '🇧🇧', '🇧🇩', '🇧🇪', '🇧🇫', '🇧🇬', '🇧🇭', '🇧🇮', '🇧🇯', '🇧🇱', '🇧🇲', '🇧🇳', '🇧🇴', '🇧🇶', '🇧🇷', '🇧🇸', '🇧🇹', '🇧🇻', '🇧🇼', '🇧🇾', '🇧🇿', '🇨🇦', '🇨🇨', '🇨🇩', '🇨🇫', '🇨🇬', '🇨🇭', '🇨🇮', '🇨🇰', '🇨🇱', '🇨🇲', '🇨🇳', '🇨🇴', '🇨🇵', '🇨🇷', '🇨🇺', '🇨🇻', '🇨🇼', '🇨🇽', '🇨🇾', '🇨🇿', '🇩🇪', '🇩🇬', '🇩🇯', '🇩🇰', '🇩🇲', '🇩🇴', '🇩🇿', '🇪🇦', '🇪🇨', '🇪🇪', '🇪🇬', '🇪🇭', '🇪🇷', '🇪🇸', '🇪🇹', '🇪🇺', '🇫🇮', '🇫🇯', '🇫🇰', '🇫🇲', '🇫🇴', '🇫🇷', '🇬🇦', '🇬🇧', '🇬🇩', '🇬🇪', '🇬🇫', '🇬🇬', '🇬🇭', '🇬🇮', '🇬🇱', '🇬🇲', '🇬🇳', '🇬🇵', '🇬🇶', '🇬🇷', '🇬🇸', '🇬🇹', '🇬🇺', '🇬🇼', '🇬🇾', '🇭🇰', '🇭🇲', '🇭🇳', '🇭🇷', '🇭🇹', '🇭🇺', '🇮🇨', '🇮🇩', '🇮🇪', '🇮🇱', '🇮🇲', '🇮🇳', '🇮🇴', '🇮🇶', '🇮🇷', '🇮🇸', '🇮🇹', '🇯🇪', '🇯🇲', '🇯🇴', '🇯🇵', '🇰🇪', '🇰🇬', '🇰🇭', '🇰🇮', '🇰🇲', '🇰🇳', '🇰🇵', '🇰🇷', '🇰🇼', '🇰🇾', '🇰🇿', '🇱🇦', '🇱🇧', '🇱🇨', '🇱🇮', '🇱🇰', '🇱🇷', '🇱🇸', '🇱🇹', '🇱🇺', '🇱🇻', '🇱🇾', '🇲🇦', '🇲🇨', '🇲🇩', '🇲🇪', '🇲🇫', '🇲🇬', '🇲🇭', '🇲🇰', '🇲🇱', '🇲🇲', '🇲🇳', '🇲🇴', '🇲🇵', '🇲🇶', '🇲🇷', '🇲🇸', '🇲🇹', '🇲🇺', '🇲🇻', '🇲🇼', '🇲🇽', '🇲🇾', '🇲🇿', '🇳🇦', '🇳🇨', '🇳🇪', '🇳🇫', '🇳🇬', '🇳🇮', '🇳🇱', '🇳🇴', '🇳🇵', '🇳🇷', '🇳🇺', '🇳🇿', '🇴🇲', '🇵🇦', '🇵🇪', '🇵🇫', '🇵🇬', '🇵🇭', '🇵🇰', '🇵🇱', '🇵🇲', '🇵🇳', '🇵🇷', '🇵🇸', '🇵🇹', '🇵🇼', '🇵🇾', '🇶🇦', '🇷🇪', '🇷🇴', '🇷🇸', '🇷🇺', '🇷🇼', '🇸🇦', '🇸🇧', '🇸🇨', '🇸🇩', '🇸🇪', '🇸🇬', '🇸🇭', '🇸🇮', '🇸🇯', '🇸🇰', '🇸🇱', '🇸🇲', '🇸🇳', '🇸🇴', '🇸🇷', '🇸🇸', '🇸🇹', '🇸🇻', '🇸🇽', '🇸🇾', '🇸🇿', '🇹🇦', '🇹🇨', '🇹🇩', '🇹🇫', '🇹🇬', '🇹🇭', '🇹🇯', '🇹🇰', '🇹🇱', '🇹🇲', '🇹🇳', '🇹🇴', '🇹🇷', '🇹🇹', '🇹🇻', '🇹🇼', '🇹🇿', '🇺🇦', '🇺🇬', '🇺🇲', '🇺🇸', '🇺🇾', '🇺🇿', '🇻🇦', '🇻🇨', '🇻🇪', '🇻🇬', '🇻🇮', '🇻🇳', '🇻🇺', '🇼🇫', '🇼🇸', '🇽🇰', '🇾🇪', '🇾🇹', '🇿🇦', '🇿🇲', '🇿🇼', '🏴‍☠️'],
  },
];

const MessagesTab: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const { user } = useAuth();
  const { socket, connected, joinUser, sendMessage, onMessage, offMessage } = useWebSocket();

  // Log WebSocket connection status
  useEffect(() => {
    console.log('[MessagesTab] WebSocket status:', { connected, hasSocket: !!socket, socketId: socket?.id });
  }, [connected, socket]);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerLayout, setEmojiPickerLayout] = useState({ width: 0, height: 0 });
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [keyboardScreenY, setKeyboardScreenY] = useState<number | null>(null);
  const [inputContainerHeight, setInputContainerHeight] = useState(70); // Default estimate, will be updated from onLayout
  const [deviceInfo, setDeviceInfo] = useState(getDeviceInfo());
  const [menuVisible, setMenuVisible] = useState<string | null>(null); // messageId of message with open menu
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<View>(null);
  const scrollViewRef = useRef<KeyboardAwareScrollView>(null);
  const menuButtonRefs = useRef<{ [key: string]: View | null }>({});
  const hasAutoSelectedRef = useRef<boolean>(false);
  const isLoadingConversationsRef = useRef<boolean>(false);
  const lastConversationsLoadRef = useRef<number>(0);
  const conversationsRetryDelayRef = useRef<number>(5000); // Start with 5 seconds
  const lastSendTimeRef = useRef<number>(0);
  const lastSendMessageRef = useRef<string>("");

  // Reset auto-select flag when component mounts (tab is opened)
  useEffect(() => {
    hasAutoSelectedRef.current = false;
  }, []);

  // Update device info on dimension changes (orientation, etc.)
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDeviceInfo(getDeviceInfo());
    });
    return () => subscription?.remove();
  }, []);

  // Handle keyboard show/hide with reliable positioning
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardWillShowListener = Keyboard.addListener(
      showEvent,
      (e) => {
        const keyboardHeight = e.endCoordinates.height;
        const screenHeight = Dimensions.get('window').height;
        const keyboardScreenY = (e.endCoordinates as any)?.screenY;
        setKeyboardHeight(keyboardHeight);
        setKeyboardScreenY(typeof keyboardScreenY === 'number' ? keyboardScreenY : null);

        // Scroll to bottom when keyboard appears
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 300);
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      hideEvent,
      () => {
        setKeyboardHeight(0);
        setKeyboardScreenY(null);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (connected && user?._id) {
      joinUser(user._id);
    }
  }, [connected, user?._id, joinUser]);

  useEffect(() => {
    const freelancerId = (route.params as any)?.freelancerId;
    if (freelancerId && user?._id) {
      // Check if conversation exists
      const existingConv = conversations.find((c) => c.freelancerId === freelancerId);
      if (existingConv) {
        setSelectedConversation(existingConv);
      } else if (conversations.length > 0 || !loading) {
        // Only create new conversation if we've finished loading conversations
        // Create a new conversation entry if it doesn't exist
        setSelectedConversation({
          id: getNormalizedConversationKey(user._id, freelancerId),
          freelancerId: freelancerId,
          freelancerName: "Freelancer",
          freelancerEmail: "",
          lastMessage: "",
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
        });
      }
    }
  }, [route.params, user?._id, conversations, loading]);

  useEffect(() => {
    if (!user?._id) {
      setLoading(false);
      return;
    }

    let isActive = true;
    let pollInterval = 10000; // 10 seconds
    let timeoutId: NodeJS.Timeout | null = null;

    const loadConversations = async () => {
      if (!isActive || isLoadingConversationsRef.current) return;

      try {
        isLoadingConversationsRef.current = true;
        const rawConvs = await apiService.getConversations(user._id);
        isLoadingConversationsRef.current = false;

        if (!isActive) return;

        // Debug: log actual API response shape
        console.log("[MessagesTab] Raw conversations response type:", typeof rawConvs, Array.isArray(rawConvs), rawConvs ? Object.keys(rawConvs) : 'null');

        // Normalize: API may return a raw array or an object wrapper
        let convs: any[] = [];
        if (Array.isArray(rawConvs)) {
          convs = rawConvs;
        } else if (rawConvs && typeof rawConvs === 'object') {
          const nested = rawConvs.conversations || rawConvs.data || rawConvs.results || rawConvs.conversationList;
          convs = Array.isArray(nested) ? nested : [];
        }

        // Transform API response to Conversation format
        const transformedConvs: Conversation[] = Array.isArray(convs) ? convs.map((conv: any) => {
          const lastMsg = conv.lastMessage || {};
          const myUserId = String(user._id || "");

          // Determine the OTHER participant - compare IDs as strings to avoid type mismatches
          const senderId = (lastMsg.senderId?._id || lastMsg.senderId)?.toString?.() || "";
          const receiverId = (lastMsg.receiverId?._id || lastMsg.receiverId)?.toString?.() || "";
          const otherUser = senderId === myUserId ? lastMsg.receiverId : lastMsg.senderId;

          // Fallback: if we couldn't determine the other user, pick whichever id isn't ours
          const otherId = String(otherUser?._id || otherUser || "");
          const resolvedFreelancerId = otherId || (senderId === myUserId ? receiverId : senderId);
          const normalizedFreelancerId = String(resolvedFreelancerId || "");

          return {
            id: conv._id || conv.id || getNormalizedConversationKey(user._id, normalizedFreelancerId),
            freelancerId: normalizedFreelancerId,
            freelancerName: otherUser?.profile?.firstName && otherUser?.profile?.lastName
              ? `${otherUser.profile.firstName} ${otherUser.profile.lastName}`
              : otherUser?.email || (lastMsg.message ? "Freelancer" : "Unknown"),
            freelancerEmail: otherUser?.email || "",
            lastMessage: lastMsg.message || lastMsg.text || "",
            lastMessageTime: lastMsg.createdAt || new Date().toISOString(),
            unreadCount: conv.unreadCount || 0,
          };
        }) : [];

        // Deduplicate conversations
        const uniqueConvs = transformedConvs.reduce((acc: Conversation[], current: Conversation) => {
          const currentFreelancerId = String(current.freelancerId || "");
          const existingIndex = acc.findIndex((c) => String(c.freelancerId || "") === currentFreelancerId);

          if (existingIndex === -1) {
            acc.push(current);
          } else {
            const existing = acc[existingIndex];
            const existingTime = new Date(existing.lastMessageTime).getTime();
            const currentTime = new Date(current.lastMessageTime).getTime();

            if (currentTime > existingTime) {
              acc[existingIndex] = current;
            }
          }

          return acc;
        }, []);

        setConversations(uniqueConvs);
        setLoading(false);
        pollInterval = 10000; // Reset to 10 seconds on success
      } catch (error: any) {
        isLoadingConversationsRef.current = false;

        // Backoff on rate limit
        if (error?.message?.includes('Too many requests') || error?.message?.includes('rate limit')) {
          pollInterval = Math.min(pollInterval * 2, 60000); // Max 60 seconds
        }

        if (error?.code !== 'ERR_NETWORK' &&
          error?.message !== 'Network Error' &&
          !error?.message?.includes('Too many requests') &&
          !error?.message?.includes('rate limit')) {
          console.error("Error loading conversations:", error);
        }

        setConversations((prev) => prev.length > 0 ? prev : []);
        setLoading(false);
      }
    };

    // Initial load
    loadConversations();

    // Simple polling
    const poll = () => {
      if (!isActive) return;
      loadConversations();
      if (isActive) {
        timeoutId = setTimeout(poll, pollInterval);
      }
    };

    timeoutId = setTimeout(poll, pollInterval);

    return () => {
      isActive = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [user?._id]);

  // Auto-select first conversation when conversations are loaded and no conversation is selected
  // Only do this once on initial load, not when user navigates back
  useEffect(() => {
    const freelancerId = (route.params as any)?.freelancerId;
    // Only auto-select if:
    // 1. Not loading
    // 2. No selected conversation
    // 3. No freelancerId in route params (to avoid overriding explicit selection)
    // 4. There are conversations available
    // 5. We haven't already auto-selected (to allow user to go back to list)
    if (!loading && !selectedConversation && !freelancerId && conversations.length > 0 && !hasAutoSelectedRef.current) {
      console.log("Auto-selecting first conversation:", conversations[0]);
      setSelectedConversation(conversations[0]);
      hasAutoSelectedRef.current = true;
    }
  }, [loading, conversations, route.params]); // Removed selectedConversation from deps to avoid re-triggering

  // Reset auto-select flag when user explicitly deselects (clicks back)
  useEffect(() => {
    if (selectedConversation === null && hasAutoSelectedRef.current) {
      // User clicked back, allow them to stay on the list
      // Don't reset the flag here - we want to respect their choice
    }
  }, [selectedConversation]);

  // Debug log - must be before any conditional returns
  useEffect(() => {
    console.log("MessagesTab state:", {
      loading,
      selectedConversation: selectedConversation?.freelancerName || null,
      conversationsCount: conversations.length,
      messagesCount: messages.length,
    });
  }, [loading, selectedConversation, conversations.length, messages.length]);

  useEffect(() => {
  }, [showEmojiPicker, emojiPickerLayout.width, emojiPickerLayout.height]);

  useEffect(() => {
    if (!selectedConversation || !user?._id) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        const msgs = await apiService.getMessages(user._id, selectedConversation.freelancerId) as any[];

        // Ensure messages are properly formatted and filter out any invalid entries
        const validMessages = Array.isArray(msgs)
          ? msgs.filter((msg: any) => msg && (msg.message || msg.text || msg._id || msg.id))
          : [];
        setMessages(validMessages);
      } catch (error: any) {
        // Don't log network errors or rate limits - they're handled gracefully
        if (error?.code !== 'ERR_NETWORK' &&
          error?.message !== 'Network Error' &&
          !error?.message?.includes('Too many requests') &&
          !error?.message?.includes('rate limit')) {
          console.error("Error loading messages:", error);
        }
        // Don't clear messages on rate limit - keep existing ones
        if (!error?.message?.includes('Too many requests') &&
          !error?.message?.includes('rate limit')) {
          setMessages([]);
        }
      }
    };

    // Add a small delay to avoid immediate rate limiting if user switches conversations quickly
    const timeoutId = setTimeout(loadMessages, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [selectedConversation?.freelancerId, user?._id]);

  useEffect(() => {
    if (!selectedConversation || !user?._id) {
      setMessages([]);
      return;
    }

    // Prioritize WebSocket - only poll if WebSocket is not available
    if (socket && connected) {
      console.log('[MessagesTab] WebSocket connected, skipping polling');
      return;
    }

    let isActive = true;
    let pollInterval = 5000; // 5 seconds
    let timeoutId: NodeJS.Timeout | null = null;

    const pollMessages = async () => {
      if (!isActive) return;

      try {
        const msgs = await apiService.getMessages(user._id, selectedConversation.freelancerId);
        if (!isActive) return;
        if (!Array.isArray(msgs)) return;

        // Filter valid messages
        const validMessages = msgs.filter((msg: any) =>
          msg && (msg.message || msg.text || msg._id || msg.id)
        );

        setMessages((prev) => {
          const prevLastId = prev[prev.length - 1]?._id || prev[prev.length - 1]?.id;
          const nextLastId = validMessages[validMessages.length - 1]?._id || validMessages[validMessages.length - 1]?.id;

          if (prev.length === validMessages.length && prevLastId === nextLastId) {
            return prev;
          }
          return validMessages;
        });

        pollInterval = 5000; // Reset on success
      } catch (error: any) {
        // Backoff on rate limit
        if (error?.message?.includes('Too many requests') || error?.message?.includes('rate limit')) {
          pollInterval = Math.min(pollInterval * 2, 60000); // Max 60 seconds
        }

        if (error?.code !== 'ERR_NETWORK' && error?.message !== 'Network Error') {
          if (!error?.message?.includes('Too many requests') && !error?.message?.includes('rate limit')) {
            console.warn("[MessagesTab] Polling error:", error?.message);
          }
        }
      }

      if (isActive) {
        timeoutId = setTimeout(pollMessages, pollInterval);
      }
    };

    // Start polling after initial delay
    timeoutId = setTimeout(pollMessages, 2000);

    return () => {
      isActive = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [selectedConversation?.freelancerId, user?._id, socket, connected]);

  useEffect(() => {
    if (!socket || !selectedConversation || !user?._id) return;

    const handleNewMessage = (messageData: any) => {
      const senderId = (messageData.senderId?._id || messageData.senderId)?.toString?.() || String(messageData.senderId || "");
      const receiverId = (messageData.receiverId?._id || messageData.receiverId)?.toString?.() || String(messageData.receiverId || "");
      const currentUserId = String(user._id || "");
      const currentFreelancerId = String(selectedConversation.freelancerId || "");

      const isCurrentConversation =
        (senderId === currentUserId && receiverId === currentFreelancerId) ||
        (receiverId === currentUserId && senderId === currentFreelancerId);

      if (isCurrentConversation) {
        setMessages((prev) => {
          const messageId = String(messageData._id || messageData.id || "");
          const messageText = messageData.message || '';
          const isFromCurrentUser = senderId === currentUserId;

          // Check if message with same ID already exists
          const existsById = prev.some((m) => String(m._id || m.id || "") === messageId);

          if (existsById) {
            return prev;
          }

          // If this is a message from current user, check for temp message to replace
          if (isFromCurrentUser) {
            // Find temp message by matching content and sender, and check if it's recent (within last 10 seconds)
            const now = Date.now();
            const tempMessageIndex = prev.findIndex((m) => {
              const isTemp = m._id?.toString().startsWith('temp_') || m.isTemp;
              const matchesContent = (m.message || m.text || '') === messageText;
              const matchesSender = String(m.senderId?._id || m.senderId || "") === currentUserId;
              const isRecent = m.createdAt ? (now - new Date(m.createdAt).getTime()) < 10000 : true;

              return isTemp && matchesContent && matchesSender && isRecent;
            });

            if (tempMessageIndex !== -1) {
              // Replace temp message with real message
              const newMessages = [...prev];
              newMessages[tempMessageIndex] = messageData;
              return newMessages;
            }

            // Also check if message with same content from same sender already exists (prevent duplicates)
            const duplicateIndex = prev.findIndex((m) => {
              const msgId = String(m._id || m.id || "");
              const matchesContent = (m.message || m.text || '') === messageText;
              const matchesSender = String(m.senderId?._id || m.senderId || "") === currentUserId;
              const isRecent = m.createdAt ? (now - new Date(m.createdAt).getTime()) < 5000 : false;

              return msgId !== messageId && matchesContent && matchesSender && isRecent;
            });

            if (duplicateIndex !== -1) {
              return prev; // Don't add duplicate
            }
          }

          return [...prev, messageData];
        });
        // Scroll to bottom when new message arrives
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }

      // Update conversations list
      setConversations((prev) => {
        const updated = prev.map((conv) => {
          const convFreelancerId = String(conv.freelancerId || "");
          return convFreelancerId === senderId || convFreelancerId === receiverId
            ? {
              ...conv,
              lastMessage: messageData.message,
              lastMessageTime: messageData.createdAt || new Date().toISOString(),
            }
            : conv;
        });

        // Deduplicate after update - keep most recent for each freelancerId
        const unique = updated.reduce((acc: Conversation[], current: Conversation) => {
          const currentFreelancerId = String(current.freelancerId || "");
          const existingIndex = acc.findIndex((c) => String(c.freelancerId || "") === currentFreelancerId);

          if (existingIndex === -1) {
            acc.push(current);
          } else {
            const existing = acc[existingIndex];
            const existingTime = new Date(existing.lastMessageTime).getTime();
            const currentTime = new Date(current.lastMessageTime).getTime();

            if (currentTime > existingTime) {
              acc[existingIndex] = current;
            }
          }

          return acc;
        }, []);

        return unique;
      });
    };

    const handleMessageEdited = (messageData: any) => {
      const messageId = messageData._id || messageData.id || messageData.messageId;
      if (!messageId) return;

      setMessages((prev) =>
        prev.map((m) => {
          const msgId = m._id || m.id;
          if (msgId === messageId) {
            return {
              ...m,
              message: messageData.message || m.message,
              isEdited: true,
              editedAt: messageData.editedAt || new Date().toISOString(),
            };
          }
          return m;
        })
      );
    };

    const handleMessageDeleted = (messageData: any) => {
      const messageId = messageData.messageId || messageData._id || messageData.id;
      if (!messageId) {
        console.log("handleMessageDeleted: messageId is missing from data:", messageData);
        return;
      }

      const messageIdStr = String(messageId);
      console.log("WebSocket: Message deleted event received for:", messageIdStr);

      setMessages((prev) => {
        const filtered = prev.filter((m) => {
          const msgId = String(m._id || m.id || '');
          return msgId !== messageIdStr;
        });
        console.log("WebSocket: Messages before filter:", prev.length, "after filter:", filtered.length);
        return filtered;
      });
    };

    onMessage(handleNewMessage);
    if (socket) {
      socket.on("messageEdited", handleMessageEdited);
      socket.on("messageDeleted", handleMessageDeleted);
    }

    return () => {
      offMessage(handleNewMessage);
      if (socket) {
        socket.off("messageEdited", handleMessageEdited);
        socket.off("messageDeleted", handleMessageDeleted);
      }
    };
  }, [socket, selectedConversation, user?._id, onMessage, offMessage]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [messages.length]);

  // Handle copy message
  const handleCopyMessage = async (messageText: string) => {
    try {
      if (Platform.OS === 'web' && navigator.clipboard) {
        await navigator.clipboard.writeText(messageText);
        setMenuVisible(null);
        // Show brief feedback
        Alert.alert("Copied", "Message copied to clipboard");
      } else {
        // For React Native mobile, use expo-clipboard
        if (Platform.OS !== 'web') {
          await Clipboard.setStringAsync(messageText);
          setMenuVisible(null);
          Alert.alert("Copied", "Message copied to clipboard");
        }
      }
    } catch (error) {
      console.error("Error copying message:", error);
      setMenuVisible(null);
      Alert.alert("Error", "Failed to copy message");
    }
  };

  // Handle edit message
  const handleEditMessage = async (messageId: string, newText: string) => {
    if (!newText.trim()) {
      Alert.alert("Error", "Message cannot be empty");
      return;
    }

    try {
      await apiService.editMessage(messageId, newText);
      setEditingMessageId(null);
      setEditingText("");
      setMenuVisible(null);

      // Update message in local state
      setMessages((prev) =>
        prev.map((m) => {
          const msgId = m._id || m.id;
          if (msgId === messageId) {
            return {
              ...m,
              message: newText,
              isEdited: true,
              editedAt: new Date().toISOString(),
            };
          }
          return m;
        })
      );
    } catch (error: any) {
      console.error("Error editing message:", error);
      Alert.alert("Error", error?.message || "Failed to edit message");
    }
  };

  // Handle delete message
  const handleDeleteMessage = async (messageId: string, skipConfirmation: boolean = false) => {
    if (!messageId) {
      console.error("handleDeleteMessage: messageId is missing");
      Alert.alert("Error", "Message ID is missing");
      return;
    }

    console.log("handleDeleteMessage called with messageId:", messageId, "type:", typeof messageId);

    // Log all current message IDs for debugging
    console.log("Current messages in state:", messages.map(m => ({
      _id: m._id,
      id: m.id,
      _idString: String(m._id || ''),
      idString: String(m.id || ''),
      fullMessage: m
    })));

    // For web, use window.confirm; for mobile, use Alert.alert
    let shouldDelete = skipConfirmation;

    if (!shouldDelete) {
      if (Platform.OS === 'web') {
        shouldDelete = window.confirm("Are you sure you want to delete this message?");
      } else {
        // For mobile, we'll use a promise-based approach
        return new Promise<void>((resolve) => {
          Alert.alert(
            "Delete Message",
            "Are you sure you want to delete this message?",
            [
              {
                text: "Cancel",
                style: "cancel",
                onPress: () => {
                  setMenuVisible(null);
                  setMenuPosition(null);
                  setDeletingMessageId(null);
                  resolve();
                },
              },
              {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                  await performDelete(messageId);
                  resolve();
                },
              },
            ],
            { cancelable: true }
          );
        });
      }
    }

    if (shouldDelete) {
      await performDelete(messageId);
    } else {
      setMenuVisible(null);
      setMenuPosition(null);
      setDeletingMessageId(null);
    }
  };

  // Separate function to perform the actual deletion
  const performDelete = async (messageId: string) => {
    console.log("Delete confirmed for messageId:", messageId);
    setDeletingMessageId(messageId);

    try {
      // First, optimistically remove from UI
      const messageIdStr = String(messageId);
      console.log("Attempting to remove message with ID:", messageIdStr);

      setMessages((prev) => {
        const filtered = prev.filter((m) => {
          // Try multiple ways to get the ID
          const msgId = String(m._id || m.id || '');
          const shouldKeep = msgId !== messageIdStr;

          if (!shouldKeep) {
            console.log("✓ Found matching message to remove:");
            console.log("  - msgId:", msgId);
            console.log("  - messageIdStr:", messageIdStr);
            console.log("  - Exact match:", msgId === messageIdStr);
            console.log("  - Message object:", m);
          }
          return shouldKeep;
        });

        console.log("Messages before filter:", prev.length, "after filter:", filtered.length);

        if (prev.length === filtered.length) {
          console.warn("⚠️ No message was removed!");
          console.warn("Looking for messageId:", messageIdStr);
          console.warn("Available message IDs:", prev.map(m => ({
            _id: m._id,
            id: m.id,
            _idString: String(m._id || ''),
            idString: String(m.id || ''),
            matches: String(m._id || m.id || '') === messageIdStr
          })));
        } else {
          console.log("✓ Message successfully removed from UI");
        }

        return filtered;
      });

      // Then call API
      const response = await apiService.deleteMessage(messageId);
      console.log("Delete API response:", response);

      setMenuVisible(null);
      setMenuPosition(null);
      setDeletingMessageId(null);
    } catch (error: any) {
      console.error("Error deleting message:", error);
      console.error("Error details:", {
        message: error?.message,
        status: error?.status,
        errorData: error?.errorData,
        stack: error?.stack
      });

      // If API fails but we already removed from UI, try to restore or just show error
      // For now, we'll show error but keep it removed from UI (optimistic update)

      let errorMessage = "Failed to delete message";
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.errorData?.message) {
        errorMessage = error.errorData.message;
      } else if (error?.status === 404) {
        errorMessage = "Message not found. It may have already been deleted.";
        // Already removed from UI, so this is fine
      } else if (error?.status === 403) {
        errorMessage = "You don't have permission to delete this message.";
        // Could restore message here if needed
      } else if (error?.status === 401) {
        errorMessage = "Please log in again to delete messages.";
      }

      if (Platform.OS === 'web') {
        alert(errorMessage);
      } else {
        Alert.alert("Error", errorMessage);
      }
      setDeletingMessageId(null);
    }
  };

  const handleSend = async () => {
    const callId = `send_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const messageText = newMessage.trim();
    const now = Date.now();


    console.log('[MessagesTab] handleSend called', {
      callId,
      hasMessage: !!messageText,
      hasConversation: !!selectedConversation,
      hasUser: !!user?._id,
      sending,
      messageText,
      timeSinceLastSend: now - lastSendTimeRef.current
    });

    // Prevent duplicate sends: same message within 2 seconds
    if (messageText === lastSendMessageRef.current && (now - lastSendTimeRef.current) < 2000) {

      console.warn('[MessagesTab] Send blocked - duplicate message within 2 seconds');
      return;
    }

    if (!messageText || !selectedConversation || !user?._id || sending) {

      console.warn('[MessagesTab] Send blocked:', {
        noMessage: !messageText,
        noConversation: !selectedConversation,
        noUser: !user?._id,
        alreadySending: sending
      });
      return;
    }

    // Update refs to prevent duplicate sends
    lastSendTimeRef.current = now;
    lastSendMessageRef.current = messageText;

    setNewMessage("");
    setSending(true);

    // Declare tempMessage outside try block so it's accessible in catch
    const tempMessageId = `temp_${Date.now()}`;
    const tempMessage = {
      _id: tempMessageId,
      senderId: user._id,
      receiverId: selectedConversation.freelancerId,
      message: messageText,
      createdAt: new Date().toISOString(),
      isTemp: true,
    };

    try {

      setMessages((prev) => [...prev, tempMessage]);

      const conversationId = getNormalizedConversationKey(user._id, selectedConversation.freelancerId);

      // Try WebSocket first (primary method for real-time delivery)
      let wsAttempted = false;
      if (sendMessage && connected && socket) {
        console.log('[MessagesTab] Attempting to send via WebSocket:', {
          senderId: user._id,
          receiverId: selectedConversation.freelancerId,
          message: messageText,
          conversationId,
        });

        try {
          sendMessage({
            senderId: user._id,
            receiverId: selectedConversation.freelancerId,
            message: messageText,
            conversationId,
            messageType: 'text',
          });
          wsAttempted = true;

          console.log('[MessagesTab] WebSocket send initiated successfully');
        } catch (wsError) {

          console.error('[MessagesTab] WebSocket send failed, falling back to API:', wsError);
        }
      } else {

        console.warn('[MessagesTab] WebSocket not available:', {
          hasSendMessage: !!sendMessage,
          connected,
          hasSocket: !!socket
        });
      }

      // Always persist via API to ensure messages are saved to database
      // WebSocket is for real-time delivery, but API ensures persistence
      console.log('[MessagesTab] Attempting API persistence for message');

      try {
        console.log('[MessagesTab] Attempting to persist via API:', {
          senderId: user._id,
          receiverId: selectedConversation.freelancerId,
          message: messageText,
        });

        const apiMessage = await apiService.sendMessage({
          senderId: user._id,
          receiverId: selectedConversation.freelancerId,
          message: messageText,
          type: "text",
        });


        console.log('[MessagesTab] API persistence successful:', apiMessage);

        // Only update UI with API message if WebSocket was NOT used
        // (If WebSocket was used, the echo will replace the temp message)
        if (!wsAttempted && apiMessage) {
          setMessages((prev) => {
            const next = prev.filter((m) => (m._id || m.id) !== tempMessageId);

            return [...next, apiMessage];
          });
          setConversations((prev) => {
            const updated = prev.map((conv) =>
              String(conv.freelancerId || "") === String(selectedConversation.freelancerId || "")
                ? {
                  ...conv,
                  lastMessage: apiMessage.message || messageText,
                  lastMessageTime: apiMessage.createdAt || new Date().toISOString(),
                }
                : conv
            );

            // Deduplicate after update - keep most recent for each freelancerId
            const unique = updated.reduce((acc: Conversation[], current: Conversation) => {
              const currentFreelancerId = String(current.freelancerId || "");
              const existingIndex = acc.findIndex((c) => String(c.freelancerId || "") === currentFreelancerId);

              if (existingIndex === -1) {
                acc.push(current);
              } else {
                const existing = acc[existingIndex];
                const existingTime = new Date(existing.lastMessageTime).getTime();
                const currentTime = new Date(current.lastMessageTime).getTime();

                if (currentTime > existingTime) {
                  acc[existingIndex] = current;
                }
              }

              return acc;
            }, []);

            return unique;
          });
        } else if (wsAttempted) {

          console.log('[MessagesTab] API persisted - WebSocket echo will update UI');
        }
      } catch (apiError: any) {
        // API endpoint might not exist (messages are primarily WebSocket-based)
        // This is expected - don't treat it as an error
        const isRouteNotFound = apiError?.status === 404 ||
          apiError?.message?.includes('Route not found') ||
          apiError?.message?.includes('Not Found');

        if (isRouteNotFound) {
          // This is expected - messages are WebSocket-based, API route may not exist
          // Don't throw - just log and continue (message was attempted via WebSocket)
          console.warn('[MessagesTab] API route not found - message may not persist after refresh');
          // Don't throw error - just return successfully since WebSocket was attempted
        } else {
          // Only throw for actual errors (not 404/route not found)
          console.error('[MessagesTab] API persistence failed:', apiError);
        }
      }

      // Message will be replaced by real message from WebSocket
    } catch (error: any) {
      // Check if it's a route not found error - if so, don't log as error
      const isRouteNotFound = error?.status === 404 ||
        error?.message?.includes('Route not found') ||
        error?.message?.includes('Not Found');

      if (!isRouteNotFound) {
        // Don't log rate limit errors repeatedly
        if (!error?.message?.includes('Too many requests')) {
          console.error("Error sending message:", error);
        }
        // Remove temp message on error (only for real errors, not route not found)
        setMessages((prev) => prev.filter((m) => (m._id || m.id) !== tempMessageId));
        setNewMessage(messageText);
      } else {
        // Route not found is expected - just log info
        console.log('[MessagesTab] Route not found (expected for WebSocket-based messaging)');
      }
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString();
  };



  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? "#111827" : "#f9fafb",
      ...(Platform.OS === 'web' && {
        overflow: "visible" as any,
        position: "relative" as any,
      }),
      ...(Platform.OS === 'android' && {
        flexDirection: 'column',
      }),
    },
    conversationsList: {
      width: "100%",
      backgroundColor: darkMode ? "#111827" : "#f9fafb",
    },
    conversationItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 18,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
      backgroundColor: darkMode ? "transparent" : "#ffffff",
      marginHorizontal: 0,
      marginVertical: 1,
      ...(Platform.OS !== 'web' && {
        shadowColor: darkMode ? "#000000" : "#000000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }),
    },
    conversationItemSelected: {
      backgroundColor: darkMode ? "rgba(6, 182, 212, 0.15)" : "rgba(6, 182, 212, 0.08)",
      borderLeftWidth: 3,
      borderLeftColor: "#06b6d4",
    },
    conversationAvatarContainer: {
      position: "relative",
      marginRight: 14,
    },
    conversationAvatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: darkMode ? "rgba(6, 182, 212, 0.15)" : "rgba(6, 182, 212, 0.1)",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: darkMode ? "rgba(6, 182, 212, 0.3)" : "rgba(6, 182, 212, 0.2)",
      ...(Platform.OS !== 'web' && {
        shadowColor: "#06b6d4",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }),
    },
    conversationAvatarUnread: {
      borderColor: "#06b6d4",
      borderWidth: 2.5,
      backgroundColor: darkMode ? "rgba(6, 182, 212, 0.25)" : "rgba(6, 182, 212, 0.15)",
    },
    unreadBadge: {
      position: "absolute",
      top: -4,
      right: -4,
      backgroundColor: "#ef4444",
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 6,
      borderWidth: 2,
      borderColor: darkMode ? "#111827" : "#ffffff",
      zIndex: 10,
      ...(Platform.OS !== 'web' && {
        shadowColor: "#ef4444",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 3,
      }),
    },
    unreadBadgeText: {
      color: "#ffffff",
      fontSize: 10,
      fontWeight: "700",
      textAlign: "center",
    },
    conversationInfo: {
      flex: 1,
      justifyContent: "center",
    },
    conversationHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 6,
    },
    conversationName: {
      fontSize: Platform.OS === 'android' ? 17 : Math.max(17, 15),
      fontWeight: "600",
      color: darkMode ? "#f3f4f6" : "#111827",
      flex: 1,
      marginRight: 8,
      ...(Platform.OS === 'android' && { letterSpacing: 0 }),
    },
    conversationNameUnread: {
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
    },
    conversationMessageRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    conversationLastMessage: {
      fontSize: Platform.OS === 'android' ? 14 : Math.max(14, 13),
      color: darkMode ? "#9ca3af" : "#6b7280",
      flex: 1,
      marginRight: 8,
      ...(Platform.OS === 'android' && { letterSpacing: 0 }),
    },
    conversationLastMessageUnread: {
      color: darkMode ? "#d1d5db" : "#4b5563",
      fontWeight: "500",
    },
    conversationTime: {
      fontSize: Platform.OS === 'android' ? 12 : Math.max(12, 11),
      color: darkMode ? "#6b7280" : "#9ca3af",
      fontWeight: "500",
      marginLeft: "auto",
      ...(Platform.OS === 'android' && { letterSpacing: 0 }),
    },
    unreadIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#06b6d4",
      marginLeft: 4,
    },
    chatContainer: {
      flex: 1,
      display: 'flex',
      height: '100%',
      ...(Platform.OS !== 'web' && {
        flexGrow: 1,
        flexShrink: 1,
      }),
    },
    chatHeader: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      backgroundColor: darkMode ? "rgba(31, 41, 55, 0.5)" : "#ffffff",
    },
    chatHeaderName: {
      fontSize: 18,
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
      marginLeft: 12,
    },
    messagesContainer: {
      flex: 1,
      padding: 16,
      paddingBottom: 20,
      minHeight: 200,
      backgroundColor: darkMode ? "transparent" : "transparent",
      ...(Platform.OS === 'web' && {
        overflow: "visible" as any,
      }),
      ...(Platform.OS === 'android' && {
        marginBottom: 70, // Space for input container (approximate height)
      }),
      ...(Platform.OS !== 'web' && {
        flexGrow: 1,
      }),
    },
    messageBubble: {
      maxWidth: "75%",
      minWidth: 60,
      padding: 12,
      paddingHorizontal: 14,
      borderRadius: 16,
      marginBottom: 12,
      marginHorizontal: 4,
      position: "relative",
      overflow: "visible",
      zIndex: 1,
      ...(Platform.OS !== 'web' && {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }),
    },
    messageBubbleSent: {
      backgroundColor: "#06b6d4",
      alignSelf: "flex-end",
      borderBottomRightRadius: 4,
    },
    messageBubbleReceived: {
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.06)",
      alignSelf: "flex-start",
      borderBottomLeftRadius: 4,
    },
    messageText: {
      fontSize: Platform.OS === 'android' ? 16 : Platform.OS === 'web' ? 15 : Math.max(16, 14),
      color: "#ffffff",
      lineHeight: Platform.OS === 'web' ? 20 : 22,
      ...(Platform.OS === 'android' && { letterSpacing: 0 }),
      // Ensure emojis (especially flag emojis) render properly
      ...(Platform.OS === 'web' && {
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
      }),
      includeFontPadding: Platform.OS === 'android' ? false : undefined,
      textAlignVertical: 'center',
    },
    messageTextReceived: {
      color: darkMode ? "#f3f4f6" : "#111827",
    },
    messageTime: {
      fontSize: Platform.OS === 'android' ? 10 : Platform.OS === 'web' ? 11 : Math.max(10, 8),
      color: "rgba(255, 255, 255, 0.75)",
      marginTop: 6,
      alignSelf: "flex-end",
      ...(Platform.OS === 'android' && { letterSpacing: 0 }),
    },
    messageTimeReceived: {
      color: darkMode ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.55)",
    },
    messageContent: {
      flexDirection: "row",
      alignItems: "flex-end",
      flexWrap: "wrap",
    },
    editedLabel: {
      fontSize: Platform.OS === 'android' ? 10 : Platform.OS === 'web' ? 11 : Math.max(10, 8),
      color: "rgba(255, 255, 255, 0.6)",
      fontStyle: "italic",
      marginLeft: 6,
      marginTop: 2,
    },
    editedLabelReceived: {
      color: darkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)",
    },
    messageFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      marginTop: 4,
    },
    menuButton: {
      padding: Platform.OS === 'web' ? 4 : 0,
      marginLeft: 8,
      minWidth: Platform.OS === 'web' ? 16 : 18,
      minHeight: Platform.OS === 'web' ? 16 : 18,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: Platform.OS === 'web' ? 0 : 9,
      ...(Platform.OS !== 'web' && {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
      }),
    },
    menuOverlay: {
      position: "absolute",
      top: -8,
      backgroundColor: darkMode ? "#1f2937" : "#ffffff",
      borderRadius: 8,
      paddingVertical: 4,
      minWidth: 120,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      ...(Platform.OS !== 'web' && {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 9999,
        zIndex: 9999,
      }),
      ...(Platform.OS === 'web' && {
        zIndex: 99999,
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      }),
    },
    menuBackdrop: {
      flex: 1,
      backgroundColor: "transparent",
    },
    menuOverlayAbsolute: {
      position: "absolute",
      backgroundColor: darkMode ? "#1f2937" : "#ffffff",
      borderRadius: 8,
      paddingVertical: 4,
      minWidth: 120,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      ...(Platform.OS !== 'web' && {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 9999,
      }),
      ...(Platform.OS === 'web' && {
        zIndex: 99999,
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      }),
    },
    menuOverlaySent: {
      right: -8,
    },
    menuOverlayReceived: {
      left: -8,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    menuItemDelete: {
      borderTopWidth: 1,
      borderTopColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    menuItemText: {
      fontSize: 14,
      color: darkMode ? "#ffffff" : "#111827",
      marginLeft: 10,
    },
    menuItemDeleteText: {
      color: "#ef4444",
    },
    editContainer: {
      width: "100%",
    },
    editInput: {
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
      borderRadius: 8,
      padding: 10,
      color: darkMode ? "#ffffff" : "#111827",
      fontSize: Platform.OS === 'android' ? 16 : Platform.OS === 'web' ? 15 : Math.max(16, 14),
      minHeight: 60,
      maxHeight: 120,
      textAlignVertical: "top",
      marginBottom: 8,
    },
    editActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 8,
    },
    editCancelButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 6,
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
      marginRight: 8,
    },
    editCancelText: {
      color: darkMode ? "#ffffff" : "#111827",
      fontSize: 14,
      fontWeight: "500",
    },
    editSaveButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 6,
      backgroundColor: "#06b6d4",
    },
    editSaveText: {
      color: "#ffffff",
      fontSize: 14,
      fontWeight: "600",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: 12,
      paddingHorizontal: 16,
      paddingBottom: 12 + insets.bottom,
      borderTopWidth: 1,
      borderTopColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      backgroundColor: darkMode ? "rgba(31, 41, 55, 0.95)" : "#ffffff",
      zIndex: 1000,
      ...(Platform.OS === 'android' && {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        elevation: 10,
        zIndex: 1000,
      }),
      ...(Platform.OS === 'ios' && {
        zIndex: 1000,
      }),
      ...(Platform.OS === 'web' && {
        zIndex: 10,
      }),
    },
    input: {
      flex: 1,
      height: 44,
      backgroundColor: darkMode ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.05)",
      borderRadius: 22,
      paddingHorizontal: 16,
      fontSize: Platform.OS === 'android' ? 16 : Math.max(16, 14),
      color: darkMode ? "#ffffff" : "#000000",
      marginRight: 8,
    },
    emojiButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 8,
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
      zIndex: 10,
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "#06b6d4",
      alignItems: "center",
      justifyContent: "center",
    },
    emojiPickerContainer: {
      height: 260,
      borderTopWidth: 1,
      borderTopColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      backgroundColor: darkMode ? "rgba(17, 24, 39, 0.98)" : "#ffffff",
      ...(Platform.OS === 'android' && {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
      }),
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 40,
      paddingTop: 80,
    },
    emptyIconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: darkMode ? "#e5e7eb" : "#374151",
      textAlign: "center",
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 15,
      color: darkMode ? "#9ca3af" : "#6b7280",
      textAlign: "center",
      lineHeight: 22,
      paddingHorizontal: 40,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 40,
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#06b6d4" />
        </View>
      </View>
    );
  }

  if (!selectedConversation) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.conversationsList}>
          {conversations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={64}
                  color={darkMode ? "#4b5563" : "#9ca3af"}
                />
              </View>
              <Text style={styles.emptyTitle}>No conversations yet</Text>
              <Text style={styles.emptyText}>
                Start a conversation from Find Freelancers to connect with talented professionals
              </Text>
            </View>
          ) : (
            conversations.map((conv, index) => (
              <Animated.View
                key={conv.id}
                entering={FadeIn.delay(index * 50).duration(300)}
              >
                <TouchableOpacity
                  style={[
                    styles.conversationItem,
                    selectedConversation?.id === conv.id && styles.conversationItemSelected
                  ]}
                  onPress={() => setSelectedConversation(conv)}
                  activeOpacity={0.7}
                >
                  <View style={styles.conversationAvatarContainer}>
                    <View style={[
                      styles.conversationAvatar,
                      conv.unreadCount > 0 && styles.conversationAvatarUnread
                    ]}>
                      <Ionicons
                        name="person"
                        size={28}
                        color={darkMode ? "#e5e7eb" : "#4b5563"}
                      />
                    </View>
                    {conv.unreadCount > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadBadgeText}>
                          {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.conversationInfo}>
                    <View style={styles.conversationHeaderRow}>
                      <Text
                        style={[
                          styles.conversationName,
                          conv.unreadCount > 0 && styles.conversationNameUnread
                        ]}
                        numberOfLines={1}
                      >
                        {conv.freelancerName}
                      </Text>
                      <Text style={styles.conversationTime}>{formatTime(conv.lastMessageTime)}</Text>
                    </View>
                    <View style={styles.conversationMessageRow}>
                      <Text
                        style={[
                          styles.conversationLastMessage,
                          conv.unreadCount > 0 && styles.conversationLastMessageUnread
                        ]}
                        numberOfLines={1}
                      >
                        {conv.lastMessage || "No messages yet"}
                      </Text>
                      {conv.unreadCount > 0 && (
                        <View style={styles.unreadIndicator} />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={() => setSelectedConversation(null)}>
          <Ionicons name="arrow-back" size={24} color={darkMode ? "#ffffff" : "#000000"} />
        </TouchableOpacity>
        <Text style={styles.chatHeaderName}>{selectedConversation.freelancerName}</Text>
      </View>

      <KeyboardAwareScrollView
        innerRef={(ref: any) => {
          scrollViewRef.current = ref;
        }}
        style={styles.messagesContainer}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: messages.length === 0 ? 'center' : 'flex-start',
          paddingBottom: Platform.OS === 'web'
            ? 120
            : (Platform.OS === 'android' && keyboardHeight > 0 && keyboardHeight < 280
              ? 250  // Increased padding for Samsung devices
              : Platform.OS === 'android' && keyboardHeight > 400
                ? keyboardHeight + 140  // Tecno: keep messages above input
                : 100),
          minHeight: messages.length === 0 ? '100%' : undefined,
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        showsVerticalScrollIndicator={Platform.OS === 'web'}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={Platform.OS === 'android' && keyboardHeight > 0 && keyboardHeight < 280 ? 150 : 20}
        extraHeight={Platform.OS === 'android' && keyboardHeight > 0 && keyboardHeight < 280 ? 180 : 20}
        onContentSizeChange={() => {
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }}
        onLayout={() => {
          if (messages.length > 0) {
            setTimeout(() => {
              scrollViewRef.current?.scrollToEnd({ animated: false });
            }, 200);
          }
        }}
        onScrollBeginDrag={() => {
          // Close menu when scrolling
          if (menuVisible) {
            setMenuVisible(null);
            setMenuPosition(null);
          }
        }}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={48} color={darkMode ? "#9ca3af" : "#6b7280"} />
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptyText}>Start the conversation!</Text>
          </View>
        ) : (
          messages.map((msg, index) => {
            const isSent = String(msg.senderId?._id || msg.senderId || "") === String(user?._id || "");
            const messageText = msg.message || msg.text || '';
            // Don't filter out messages - display all messages even if text is empty (might have other content)
            // if (!messageText) return null;

            const messageId = msg._id || msg.id || `msg-${index}`;
            const isMenuOpen = menuVisible === messageId;
            const isEditing = editingMessageId === messageId;
            const isDeleting = deletingMessageId === messageId;

            return (
              <Animated.View
                key={messageId}
                entering={FadeIn.duration(300)}
                style={[
                  styles.messageBubble,
                  isSent ? styles.messageBubbleSent : styles.messageBubbleReceived,
                ]}
              >
                {isEditing ? (
                  <View style={styles.editContainer}>
                    <TextInput
                      style={styles.editInput}
                      value={editingText}
                      onChangeText={setEditingText}
                      multiline
                      autoFocus
                      placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                    />
                    <View style={styles.editActions}>
                      <TouchableOpacity
                        style={styles.editCancelButton}
                        onPress={() => {
                          setEditingMessageId(null);
                          setEditingText("");
                          setMenuVisible(null);
                        }}
                      >
                        <Text style={styles.editCancelText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.editSaveButton}
                        onPress={() => handleEditMessage(messageId, editingText)}
                      >
                        <Text style={styles.editSaveText}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <>
                    <View style={styles.messageContent}>
                      <Text
                        style={[styles.messageText, !isSent && styles.messageTextReceived]}
                        selectable={Platform.OS === 'web'}
                        allowFontScaling={true}
                        adjustsFontSizeToFit={false}
                      >
                        {messageText || ' '}
                      </Text>
                      {msg.isEdited && (
                        <Text style={[styles.editedLabel, !isSent && styles.editedLabelReceived]}>
                          (edited)
                        </Text>
                      )}
                    </View>
                    <View style={styles.messageFooter}>
                      <Text style={[styles.messageTime, !isSent && styles.messageTimeReceived]}>
                        {formatTime(msg.createdAt || msg.timestamp || msg.date || new Date().toISOString())}
                      </Text>
                      {isSent && (
                        <View
                          ref={(ref) => {
                            if (ref) menuButtonRefs.current[messageId] = ref;
                          }}
                          collapsable={false}
                          style={Platform.OS !== 'web' ? {
                            marginLeft: 4,
                          } : {}}
                        >
                          <TouchableOpacity
                            style={styles.menuButton}
                            onPress={() => {
                              console.log("Menu button pressed on", Platform.OS);
                              if (isMenuOpen) {
                                setMenuVisible(null);
                                setMenuPosition(null);
                              } else {
                                // Measure button position
                                const buttonRef = menuButtonRefs.current[messageId];
                                if (buttonRef) {
                                  buttonRef.measureInWindow((x, y, width, height) => {
                                    setMenuPosition({ x, y });
                                    setMenuVisible(messageId);
                                  });
                                } else {
                                  setMenuVisible(messageId);
                                }
                              }
                            }}
                            hitSlop={{ top: Platform.OS === 'web' ? 10 : 12, bottom: Platform.OS === 'web' ? 10 : 12, left: Platform.OS === 'web' ? 10 : 12, right: Platform.OS === 'web' ? 10 : 12 }}
                            activeOpacity={0.5}
                          >
                            {isDeleting ? (
                              <ActivityIndicator
                                size="small"
                                color={isSent ? "#ffffff" : (darkMode ? "#ffffff" : "#000000")}
                              />
                            ) : (
                              <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <Ionicons
                                  name="ellipsis-vertical"
                                  size={Platform.OS === 'web' ? 16 : 12}
                                  color={isSent
                                    ? "#ffffff"
                                    : (darkMode ? "#ffffff" : "#000000")}
                                  style={{
                                    ...(Platform.OS !== 'web' && {
                                      textShadowColor: 'rgba(0, 0, 0, 0.3)',
                                      textShadowOffset: { width: 0, height: 1 },
                                      textShadowRadius: 2,
                                    })
                                  }}
                                />
                              </View>
                            )}
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </>
                )}
              </Animated.View>
            );
          })
        )}
        <View ref={messagesEndRef} />
      </KeyboardAwareScrollView>

      <View
        style={[
          styles.inputContainer,
          Platform.OS === 'android' && keyboardHeight > 0 && {
            bottom: (() => {
              if (keyboardHeight > 400) {
                // Tecno: place input just above keyboard, clamped to visible area
                const screenHeight = Dimensions.get('window').height;
                const maxBottom = Math.max(0, screenHeight - inputContainerHeight - insets.bottom - 4);
                const computedBottom = Math.min(Math.max(0, keyboardHeight - insets.bottom), maxBottom);
                return computedBottom;
              } else if (keyboardHeight < 280) {
                // Samsung: large buffer to prevent overlap
                const computedBottom = keyboardHeight + 180;
                return computedBottom;
              } else {
                // Default for other devices
                const computedBottom = keyboardHeight + 20;
                return computedBottom;
              }
            })(),
          }
        ]}
        onLayout={(event) => {
          const { y, height, width } = event.nativeEvent.layout;
          const screenHeight = Dimensions.get('window').height;
        }}
      >
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
          value={newMessage}
          onChangeText={setNewMessage}
          onFocus={() => {
            setShowEmojiPicker(false);
            // Multiple scroll attempts to ensure input stays visible
            setTimeout(() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
            setTimeout(() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 300);
            setTimeout(() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 500);
          }}
          onBlur={() => {
            // Keep keyboard visible on blur for better UX
            // Don't hide keyboard immediately
          }}
          blurOnSubmit={false}
          multiline
          maxLength={1000}
          returnKeyType="default"
          textContentType="none"
          autoCorrect={true}
          autoCapitalize="sentences"
        />
        <TouchableOpacity
          style={styles.emojiButton}
          onPress={() => {
            console.log('Emoji button pressed');
            setShowEmojiPicker((prev) => !prev);
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="happy-outline" size={20} color={darkMode ? "#ffffff" : "#111827"} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sendButton, (!newMessage.trim() || sending) && { opacity: 0.5 }]}
          onPress={(e) => {
            console.log('[MessagesTab] Send button pressed');
            e.preventDefault();
            e.stopPropagation();
            handleSend();
          }}
          disabled={!newMessage.trim() || sending}
          activeOpacity={0.7}
        >
          {sending ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Ionicons name="send" size={20} color="#ffffff" />
          )}
        </TouchableOpacity>
      </View>
      {showEmojiPicker && Platform.OS !== 'android' && Platform.OS !== 'web' && (
        <View
          style={styles.emojiPickerContainer}
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            setEmojiPickerLayout({ width, height });
          }}
        >
          <EmojiSelector
            onEmojiSelected={(emoji) => setNewMessage((prev) => prev + emoji)}
            showSearchBar={false}
            showSectionTitles={false}
            columns={8}
          />
        </View>
      )}
      {showEmojiPicker && (Platform.OS === 'android' || Platform.OS === 'web') && (
        <View style={[styles.emojiPickerContainer, keyboardHeight > 0 && { bottom: keyboardHeight }]}>
          <ScrollView style={{ flex: 1 }}>
            {EMOJI_CATEGORIES.map((category, categoryIndex) => {
              return (
                <View key={categoryIndex} style={{ marginBottom: 16 }}>
                  <Text style={{
                    fontSize: Platform.OS === 'android' ? 14 : Platform.OS === 'web' ? 13 : Math.max(14, 12),
                    fontWeight: '700',
                    color: darkMode ? '#ffffff' : '#000000',
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    ...(Platform.OS === 'android' && { letterSpacing: 0 }),
                  }}>
                    {category.name}
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 8 }}>
                    {category.emojis.map((emoji, emojiIndex) => {
                      // Smaller emojis for web/PC, normal size for mobile
                      const emojiFontSize = Platform.OS === 'web'
                        ? 18
                        : Platform.OS === 'android'
                          ? 24
                          : 22;
                      return (
                        <TouchableOpacity
                          key={`${categoryIndex}-${emojiIndex}`}
                          style={{
                            padding: Platform.OS === 'web' ? 4 : 8,
                            minWidth: Platform.OS === 'web' ? 28 : 40,
                            minHeight: Platform.OS === 'web' ? 28 : 40,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                          onPress={() => {
                            setNewMessage((prev) => prev + emoji);
                            setShowEmojiPicker(false);
                          }}
                        >
                          <Text style={{
                            fontSize: emojiFontSize,
                            ...(Platform.OS === 'android' && { letterSpacing: 0 }),
                            textAlign: 'center',
                          }}>
                            {emoji}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Menu Overlay - Rendered outside ScrollView to ensure it's above input */}
      {menuVisible && menuPosition && (() => {
        const activeMessage = messages.find((msg) => {
          const msgId = msg._id || msg.id || `msg-${messages.indexOf(msg)}`;
          return msgId === menuVisible;
        });
        if (!activeMessage) {
          console.log("Active message not found for menuVisible:", menuVisible);
          return null;
        }
        const isSent = (activeMessage.senderId?._id || activeMessage.senderId) === user?._id;
        const messageText = activeMessage.message || activeMessage.text || '';
        const actualMessageId = activeMessage._id || activeMessage.id;

        if (!actualMessageId) {
          console.error("Message ID is missing from activeMessage:", activeMessage);
          return null;
        }
        const screenHeight = Dimensions.get('window').height;
        return (
          <Modal
            visible={true}
            transparent={true}
            animationType="none"
            onRequestClose={() => {
              setMenuVisible(null);
              setMenuPosition(null);
            }}
          >
            <TouchableOpacity
              style={styles.menuBackdrop}
              activeOpacity={1}
              onPress={() => {
                setMenuVisible(null);
                setMenuPosition(null);
              }}
            >
              <View
                style={[
                  styles.menuOverlayAbsolute,
                  {
                    top: menuPosition.y - 8,
                    right: Dimensions.get('window').width - menuPosition.x - 8,
                  }
                ]}
                pointerEvents="box-none"
                onLayout={(event) => {
                  const { y, height, width } = event.nativeEvent.layout;
                  const screenHeight = Dimensions.get('window').height;
                }}
              >
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setEditingMessageId(actualMessageId);
                    setEditingText(messageText);
                    setMenuVisible(null);
                    setMenuPosition(null);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="create-outline" size={18} color={darkMode ? "#ffffff" : "#111827"} />
                  <Text style={styles.menuItemText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    handleCopyMessage(messageText);
                    setMenuVisible(null);
                    setMenuPosition(null);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="copy-outline" size={18} color={darkMode ? "#ffffff" : "#111827"} />
                  <Text style={styles.menuItemText}>Copy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.menuItem, styles.menuItemDelete]}
                  onPress={async () => {
                    console.log("Delete button pressed, actualMessageId:", actualMessageId);
                    setMenuVisible(null);
                    setMenuPosition(null);
                    // Call delete after closing menu to avoid state issues
                    setTimeout(() => {
                      handleDeleteMessage(actualMessageId, false);
                    }, 100);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  <Text style={[styles.menuItemText, styles.menuItemDeleteText]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        );
      })()}
    </View>
  );
};

export default MessagesTab;
