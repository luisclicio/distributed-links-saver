import {
  Box,
  Button,
  Card,
  Container,
  CopyButton,
  Divider,
  Group,
  Image,
  MantineProvider,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { hasLength, useForm } from '@mantine/form';
import { Notifications, notifications } from '@mantine/notifications';
import {
  IconCopy,
  IconExternalLink,
  IconInfoCircle,
  IconRefresh,
  IconSend,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useInterval } from '@mantine/hooks';

export function App() {
  const theme = useMantineTheme();
  const form = useForm({
    initialValues: {
      links: '',
    },

    validate: {
      links: hasLength({ min: 1, trim: true }),
    },
  });
  const [links, setLinks] = useState([]);

  async function handleSubmit(event) {
    form.onSubmit(async () => {
      try {
        const linksParsed = form.values.links
          .split(';')
          .map((link) => link.trim());

        const response = await fetch('/api/links', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ links: linksParsed }),
        });
        const data = await response.json();

        if (response.ok && data?.success) {
          form.reset();

          notifications.show({
            id: 'send-links',
            title: 'Links enviados!',
            message:
              'Seus links foram enviados para processamento. Aguarde alguns instantes e atualize a lista.',
          });
        }
      } catch (error) {
        console.error(error);
      }
    })(event);
  }

  async function fetchLinks() {
    try {
      const response = await fetch('/api/links');
      const data = await response.json();

      if (response.ok && data?.success) {
        setLinks(data.links.reverse());
      }
    } catch (error) {
      console.error(error);
    }
  }

  const updateInterval = useInterval(fetchLinks, 20000); // 20 seconds

  useEffect(() => {
    fetchLinks();
    updateInterval.start();

    return updateInterval.stop;
  }, []);

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <Notifications />

      <Box sx={{ borderTop: `8px solid ${theme.colors.blue[6]}` }}>
        <Container size="xl" p="md" my="xl">
          <Stack component="header" spacing="xs">
            <Title align="center" color="blue">
              Distributed Links Saver App
            </Title>

            <Text align="center" color="dimmed">
              Adicione links para que eles sejam processados de forma
              distribuída e assíncrona!
            </Text>

            <Stack
              component="form"
              spacing="sm"
              maw={620}
              w="100%"
              mx="auto"
              mt="md"
              onSubmit={handleSubmit}
            >
              <Textarea
                placeholder="Ex: https://example.com/page1; https://example.com/page2"
                {...form.getInputProps('links')}
              />

              <Button type="submit" fullWidth leftIcon={<IconSend />}>
                Processar links
              </Button>
            </Stack>
          </Stack>

          <Divider my="xl" />

          <Box component="main">
            <Group position="apart" spacing="xs">
              <Title order={2}>Links processados</Title>

              <Button
                variant="default"
                color="blue"
                leftIcon={<IconRefresh />}
                onClick={fetchLinks}
              >
                Atualizar lista
              </Button>
            </Group>

            {links?.length > 0 ? (
              <SimpleGrid
                cols={4}
                spacing="md"
                mt="md"
                breakpoints={[
                  { maxWidth: 1200, cols: 3 },
                  { maxWidth: 900, cols: 2 },
                  { maxWidth: 600, cols: 1 },
                ]}
              >
                {links.map(
                  ({ _id, url, title, description, screenshotFileName }) => (
                    <LinkCard
                      key={_id}
                      url={url}
                      title={title}
                      description={description}
                      imageId={screenshotFileName}
                    />
                  )
                )}
              </SimpleGrid>
            ) : (
              <Stack align="center" spacing="xs" mt="xl">
                <IconInfoCircle
                  size={48}
                  color={theme.colors.gray[5]}
                  strokeWidth={1.5}
                />

                <Text size="lg" color="dimmed">
                  Ops... Nenhum link processado ainda!
                </Text>
              </Stack>
            )}
          </Box>
        </Container>
      </Box>
    </MantineProvider>
  );
}

function LinkCard({ url, title, description, imageId }) {
  return (
    <Card shadow="sm" padding="md" radius="md" withBorder>
      <Card.Section>
        <Image src={`/static/${imageId}`} alt={title} height={200} />
      </Card.Section>

      <Text weight="bold" size="lg" mt="md">
        {title}
      </Text>

      <Text color="dimmed" size="sm" mb="md">
        {description}
      </Text>

      <Group grow mt="auto" spacing="xs">
        <Button
          component="a"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          variant="subtle"
          fullWidth
          leftIcon={<IconExternalLink />}
        >
          Abrir link
        </Button>

        <CopyButton value={url}>
          {({ copied, copy }) => (
            <Button
              variant={copied ? 'filled' : 'subtle'}
              fullWidth
              leftIcon={<IconCopy />}
              onClick={copy}
            >
              {copied ? 'Copiado!' : 'Copiar'}
            </Button>
          )}
        </CopyButton>
      </Group>
    </Card>
  );
}
