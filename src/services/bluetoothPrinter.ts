import { PermissionsAndroid, Platform } from 'react-native';
import RNBluetoothClassic, { BluetoothDevice } from 'react-native-bluetooth-classic';
import { formatCurrency } from '../utils/currency';
import { formatDiningLabel } from '../utils/orderHelpers';
import { Order, OrderItem } from '../types';

async function ensureBluetoothPermissions(): Promise<void> {
  if (Platform.OS !== 'android') return;

  const permissions = [
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  ].filter(Boolean);

  const results = await PermissionsAndroid.requestMultiple(permissions);
  const denied = Object.entries(results).some(
    ([, status]) => status !== PermissionsAndroid.RESULTS.GRANTED
  );
  if (denied) {
    throw new Error('Bluetooth permission was not granted. Enable it in Android Settings > Apps > Sales Tracker > Permissions.');
  }
}

const ESC_INIT = '\x1B\x40';
const ESC_ALIGN_CENTER = '\x1B\x61\x01';
const ESC_ALIGN_LEFT = '\x1B\x61\x00';
const ESC_BOLD_ON = '\x1B\x45\x01';
const ESC_BOLD_OFF = '\x1B\x45\x00';
const ESC_FEED_CUT = '\x1D\x56\x00';

const RECEIPT_WIDTH = 32;

function padLine(left: string, right: string): string {
  const space = Math.max(1, RECEIPT_WIDTH - left.length - right.length);
  return `${left}${' '.repeat(space)}${right}`;
}

function dashedDivider(): string {
  return '-'.repeat(RECEIPT_WIDTH);
}

export function buildEscPosReceipt(order: Order, items: OrderItem[]): string {
  const lines: string[] = [];
  lines.push(ESC_INIT);
  lines.push(ESC_ALIGN_CENTER, ESC_BOLD_ON, `${order.order_number}\n`, ESC_BOLD_OFF);
  lines.push(`${formatDiningLabel(order)}\n`);
  lines.push(`${new Date(order.created_at).toLocaleString()}\n`);
  if (order.customer_name) lines.push(`Customer: ${order.customer_name}\n`);
  if (order.notes) lines.push(`Notes: ${order.notes}\n`);
  lines.push(ESC_ALIGN_LEFT, `${dashedDivider()}\n`);

  for (const item of items) {
    lines.push(`${item.name}\n`);
    lines.push(`${padLine(`${item.quantity} x ${formatCurrency(item.unit_price)}`, formatCurrency(item.subtotal))}\n`);
  }

  lines.push(`${dashedDivider()}\n`);
  lines.push(ESC_BOLD_ON, `${padLine('Total', formatCurrency(order.total_amount))}\n`, ESC_BOLD_OFF);
  lines.push('\n\n\n', ESC_FEED_CUT);

  return lines.join('');
}

export async function listPairedDevices(): Promise<BluetoothDevice[]> {
  await ensureBluetoothPermissions();
  return RNBluetoothClassic.getBondedDevices();
}

export async function connectAndPrint(address: string, order: Order, items: OrderItem[]): Promise<void> {
  await ensureBluetoothPermissions();
  const receipt = buildEscPosReceipt(order, items);
  let device: BluetoothDevice | null = null;
  try {
    const alreadyConnected = await RNBluetoothClassic.isDeviceConnected(address);
    device = alreadyConnected
      ? await RNBluetoothClassic.getConnectedDevice(address)
      : await RNBluetoothClassic.connectToDevice(address);
    await device.write(receipt, 'ascii');
  } finally {
    if (device) {
      await device.disconnect().catch(() => {});
    }
  }
}

export async function sendTestPrint(address: string): Promise<void> {
  await ensureBluetoothPermissions();
  const lines = [
    ESC_INIT,
    ESC_ALIGN_CENTER,
    ESC_BOLD_ON,
    'Test Print\n',
    ESC_BOLD_OFF,
    ESC_ALIGN_LEFT,
    'Printer connected successfully.\n',
    '\n\n\n',
    ESC_FEED_CUT,
  ].join('');

  let device: BluetoothDevice | null = null;
  try {
    const alreadyConnected = await RNBluetoothClassic.isDeviceConnected(address);
    device = alreadyConnected
      ? await RNBluetoothClassic.getConnectedDevice(address)
      : await RNBluetoothClassic.connectToDevice(address);
    await device.write(lines, 'ascii');
  } finally {
    if (device) {
      await device.disconnect().catch(() => {});
    }
  }
}
