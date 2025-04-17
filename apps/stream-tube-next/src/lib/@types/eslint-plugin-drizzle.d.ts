declare module "eslint-plugin-drizzle" {
  const configs: Record<string, ClassicConfig.Config>;
  const meta: FlatConfig.PluginMeta;
  const rules: typeof rules;
  export { configs, meta, rules };
}
