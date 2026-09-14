// app/+not-found.tsx
//
// The shell's not-found screen — the honest dead end. Neutral starter
// copy; consumers override the strings (or the whole composition) with
// their brand's voice. Excluded from SB1 by filename, but it composes
// ScreenScaffold anyway (the centered column + atmosphere read is the
// same as every other screen).

import React from 'react';
import { View } from 'react-native';
import { ScreenScaffold } from '../components/composed';
import { EmptyState, MobileSurface } from '../components/MobilePremium';
import { replaceWithHome } from '../navigation';

export default function NotFoundScreen() {
  return (
    <ScreenScaffold surface="analytics">
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <MobileSurface padding={20}>
          <EmptyState
            title="Page not found"
            message="The page you're looking for doesn't exist or has moved."
            action={{
              label: 'Back to home',
              onPress: replaceWithHome,
              variant: 'primary',
            }}
          />
        </MobileSurface>
      </View>
    </ScreenScaffold>
  );
}
