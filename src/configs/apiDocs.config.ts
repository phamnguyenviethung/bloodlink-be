import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';

import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export async function configSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Blood Donation Management System')
    .setDescription(
      '## Description\n\nComprehensive API for managing blood donation campaigns, emergency requests, inventory, and user accounts.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'jwt',
    )
    .addSecurityRequirements('jwt')
    // Add tag metadata for better organization
    .addTag('Auth', 'Authentication and authorization')
    .addTag('Admin', 'Admin account management and operations')
    .addTag('Staff', 'Staff account management and operations')
    .addTag('Customer', 'Customer account management and operations')
    .addTag('Hospital', 'Hospital account management and operations')
    .addTag('Campaigns', 'Blood donation campaign management')
    .addTag('Donations', 'Donation request and result management')
    .addTag('Emergency Request', 'Emergency blood request management')
    .addTag('Inventory', 'Blood inventory and compatibility management')
    .addTag('Blood Information', 'Blood type information and compatibility')
    .addTag('Blog', 'Blog post management')
    .addTag('Location', 'Location and province management')
    .addTag('Statistics', 'System statistics and analytics')
    .build();
  // await SwaggerModule.loadPluginMetadata(metadata);
  const document = SwaggerModule.createDocument(app, config);
  const theme = new SwaggerTheme();

  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      filter: true, // This enables the "Filter by tag" feature
    },
    customCss: theme.getBuffer(SwaggerThemeNameEnum.DARK),
    explorer: true,
  });
}
