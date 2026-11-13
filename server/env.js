// Environment variables are named SHOW_AND_TELL_*. The names from before the
// tool was renamed (AGENTATION_KIT_*) still work, and the code reads those:
// this copies each new name onto its old one, once, unless the old one is set
// too. Import it before anything that reads the environment.
const NEW = 'SHOW_AND_TELL_', OLD = 'AGENTATION_KIT_';
for (const [key, value] of Object.entries(process.env)) {
  if (!key.startsWith(NEW)) continue;
  const old = OLD + key.slice(NEW.length);
  if (process.env[old] === undefined) process.env[old] = value;
}
