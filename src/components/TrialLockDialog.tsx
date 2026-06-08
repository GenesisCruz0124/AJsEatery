import React from 'react';
import { Portal, Dialog, Text, Button } from 'react-native-paper';
import { router } from 'expo-router';

interface Props {
  visible: boolean;
  onDismiss: () => void;
  message: string;
}

export function TrialLockDialog({ visible, onDismiss, message }: Props) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Trial Expired</Dialog.Title>
        <Dialog.Content>
          <Text>{message}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button
            onPress={() => {
              onDismiss();
              router.push('/activation' as Parameters<typeof router.push>[0]);
            }}
          >
            Activate
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
