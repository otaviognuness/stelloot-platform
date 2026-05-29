import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Screen } from '@/src/components/Screen';
import { useAuth } from '@/src/contexts/AuthContext';
import { useStelLootTheme } from '@/src/contexts/ThemeContext';

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const { colors } = useStelLootTheme();
  const [registerMode, setRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!email.includes('@')) {
      setError('Informe um e-mail válido.');
      return;
    }
    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.');
      return;
    }
    if (registerMode && !username.trim()) {
      setError('Informe seu nome.');
      return;
    }
    if (registerMode && password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      if (registerMode) {
        await signUp(username, email, password);
      } else {
        await signIn(email, password);
      }
      router.back();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível entrar.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.topbar}>
            <Pressable onPress={() => router.back()} style={[styles.back, { borderColor: colors.border }]}>
              <Ionicons color={colors.text} name="arrow-back" size={20} />
            </Pressable>
          </View>
          <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.logo, { borderColor: colors.accent }]}>
              <Ionicons color={colors.accent} name="game-controller-outline" size={28} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              {registerMode ? 'Criar conta' : 'Entrar na StelLoot'}
            </Text>
            <Text style={[styles.description, { color: colors.muted }]}>
              Sincronize sua wishlist e acompanhe preços alvo no celular.
            </Text>
            {registerMode && (
              <Field
                label="Nome"
                onChangeText={setUsername}
                placeholder="Seu nome"
                value={username}
              />
            )}
            <Field
              autoCapitalize="none"
              keyboardType="email-address"
              label="E-mail"
              onChangeText={setEmail}
              placeholder="seuemail@email.com"
              value={email}
            />
            <Field
              label="Senha"
              onChangeText={setPassword}
              placeholder="Mínimo de 8 caracteres"
              secureTextEntry
              value={password}
            />
            {registerMode && (
              <Field
                label="Confirmar senha"
                onChangeText={setConfirmPassword}
                placeholder="Repita a senha"
                secureTextEntry
                value={confirmPassword}
              />
            )}
            {error && <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>}
            <Pressable
              disabled={submitting}
              onPress={submit}
              style={[styles.submit, { backgroundColor: colors.accent, opacity: submitting ? 0.65 : 1 }]}>
              <Text style={[styles.submitText, { color: colors.accentText }]}>
                {submitting ? 'Aguarde...' : registerMode ? 'Cadastrar' : 'Entrar'}
              </Text>
            </Pressable>
            <Pressable onPress={() => { setRegisterMode(!registerMode); setError(''); }} style={styles.switchMode}>
              <Text style={[styles.switchText, { color: colors.accent }]}>
                {registerMode ? 'Já possui conta? Entrar' : 'Não possui conta? Cadastre-se'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );

  function Field({
    label,
    ...props
  }: { label: string } & React.ComponentProps<typeof TextInput>) {
    return (
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
        <TextInput
          placeholderTextColor={colors.muted}
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          {...props}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  back: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
    marginTop: 8,
    textAlign: 'center',
  },
  error: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 14,
  },
  field: {
    marginBottom: 15,
  },
  flex: {
    flex: 1,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 15,
    height: 52,
    paddingHorizontal: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 7,
  },
  logo: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 18,
    borderWidth: 2,
    height: 60,
    justifyContent: 'center',
    marginBottom: 17,
    width: 60,
  },
  panel: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 22,
  },
  submit: {
    alignItems: 'center',
    borderRadius: 13,
    marginTop: 20,
    padding: 16,
  },
  submitText: {
    fontSize: 15,
    fontWeight: '800',
  },
  switchMode: {
    alignItems: 'center',
    paddingTop: 20,
  },
  switchText: {
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  topbar: {
    marginBottom: 18,
  },
});
