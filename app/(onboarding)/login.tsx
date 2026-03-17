import { AppText } from '@/components/app-text';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { signInWithApple, signInWithGoogle } from '@/lib/auth/oauth';
import { useTranslation } from '@/lib/hooks';
import { Ionicons } from '@expo/vector-icons';
import { Button, useThemeColor, useToast } from 'heroui-native';
import React, { useState } from 'react';
import { View } from 'react-native';

export default function LoginScreen() {
  const [isSocialLoading, setIsSocialLoading] = useState(false);

  const { t } = useTranslation();
  const foreground = useThemeColor('foreground');
  const { toast } = useToast();
  const danger = useThemeColor('danger');

  const handleAppleLogin = async () => {
    setIsSocialLoading(true);
    try {
      await signInWithApple();
    } catch (error: any) {
      if (!error.message?.includes('hủy') && !error.message?.includes('cancel')) {
        toast.show({
          label: error.message || t('onboarding.login.apple_fail'),
          variant: 'danger',
          icon: <IconSymbol name="xmark.circle.fill" size={20} color={danger} />,
        });
      }
    } finally {
      setIsSocialLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSocialLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      if (!error.message?.includes('hủy') && !error.message?.includes('cancel')) {
        toast.show({
          label: error.message || t('onboarding.login.google_fail'),
          variant: 'danger',
          icon: <IconSymbol name="xmark.circle.fill" size={20} color={danger} />,
        });
      }
    } finally {
      setIsSocialLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScreenScrollView withKeyboardAvoidingView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: 40 }}>
        {/* Header */}
        <View className="items-center px-4">
          <AppText className="text-3xl font-bold text-foreground mb-2 text-center">
            {t('onboarding.login.welcome')}
          </AppText>
          <AppText className="text-base text-muted leading-relaxed text-center">
            {t('onboarding.login.login_desc')}
          </AppText>
        </View>

        {/* Form */}
        {/* <View className="gap-4 my-6">
          {isSignUp && (
            <TextField isRequired>
              <Label>{t('onboarding.login.name_label')}</Label>
              <Input
                value={name}
                onChangeText={setName}
                placeholder={t('onboarding.login.name_placeholder')}
                autoCapitalize="words"
              />
              <FieldError />
            </TextField>
          )}

          <TextField isRequired>
            <Label>{t('onboarding.login.email_label')}</Label>
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="name@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <FieldError />
          </TextField>

          <TextField isRequired>
            <Label>{t('onboarding.login.password_label')}</Label>
            <InputGroup>
              <InputGroup.Input
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
              />
            </InputGroup>
            <FieldError />
          </TextField>

          <Button
            size="lg"
            className="h-14 rounded-2xl bg-accent shadow-lg shadow-accent/20"
            onPress={handleEmailAuth}
            isDisabled={isLoading}
          >
            <Button.Label className="text-lg font-bold text-white">
              {isLoading ? t('onboarding.login.processing') : isSignUp ? t('onboarding.login.signup_btn') : t('onboarding.login.login_btn')}
            </Button.Label>
          </Button>

          <PressableFeedback onPress={() => setIsSignUp(!isSignUp)} className="items-center py-2">
            <AppText className="text-muted">
              {isSignUp ? t('onboarding.login.has_account') : t('onboarding.login.no_account')}
              <AppText className="text-accent font-semibold">
                {isSignUp ? t('onboarding.login.login_btn') : t('onboarding.login.signup_btn')}
              </AppText>
            </AppText>
          </PressableFeedback>
        </View> */}

        {/* Social Logins */}
        <View className="gap-4 mt-8 px-4">
          {/* <View className="flex-row items-center gap-4">
            <View className="flex-1 h-px bg-divider/20" />
            <AppText className="text-muted text-sm">{t('onboarding.login.or')}</AppText>
            <View className="flex-1 h-px bg-divider/20" />
          </View> */}

          {/* TODO: Enable after Apple Developer Program enrollment
          <Button
            className="h-14 rounded-2xl bg-black dark:bg-white"
            onPress={handleAppleLogin}
          >
            <View className="flex-row items-center gap-3">
              <Ionicons name="logo-apple" size={20} color={background} />
              <Button.Label className="font-bold" style={{ color: background }}>
                {t('onboarding.login.apple_btn')}
              </Button.Label>
            </View>
          </Button>
          */}

          <Button
            variant="secondary"
            className="h-14 rounded-2xl border border-border/10"
            onPress={handleGoogleLogin}
          >
            <View className="flex-row items-center gap-3">
              <Ionicons name="logo-google" size={20} color={foreground} />
              <Button.Label className="font-bold">{t('onboarding.login.google_btn')}</Button.Label>
            </View>
          </Button>

          {/* Footer */}
          <View className="mt-4 items-center">
            <AppText className="text-[10px] text-muted/60 text-center px-8 leading-4">
              {t('onboarding.login.terms_1')}
              <AppText className="text-accent">{t('onboarding.login.terms_2')}</AppText>{t('onboarding.login.terms_3')}
              <AppText className="text-accent">{t('onboarding.login.terms_4')}</AppText>{t('onboarding.login.terms_5')}
            </AppText>
          </View>
        </View>
      </ScreenScrollView>
    </View>
  );
}
