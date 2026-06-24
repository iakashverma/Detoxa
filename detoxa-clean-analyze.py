"""
Detoxa - Data Cleaning & Analysis Script
Cleans the raw survey export (277 rows, 25 cols) and produces a single
clean JSON file with every statistic the website needs.
"""
import pandas as pd
import numpy as np
import json
import re

df = pd.read_excel('/mnt/user-data/uploads/4__Dataset.xlsx')
RAW_N = len(df)

# -----------------------------------------------------------------------
# 1. RENAME COLUMNS to short keys
# -----------------------------------------------------------------------
df = df.rename(columns={
    'What is your age?': 'age',
    'What is your Gender': 'gender',
    'Relationship status:': 'relationship',
    'Has use of social media jeopardized your studies, finances, relationship or career?': 'jeopardized',
    'What is your occupation?': 'occupation',
    'How many hours you spend on your occupation/workspace per day (in hours)?': 'work_hours',
    'Which social media platform do you commonly use?': 'platform',
    'How many hours do you spend on social media in a day?': 'sm_hours_bucket',
    'Do you ever go on social media sites to quickly check something and then discover that hours have passed': 'time_loss_freq',
    'How often do you find yourself using Social media without a specific purpose?': 'purposeless_use_freq',
    "Do you feel restless if you haven't used Social media in a while?": 'restless',
    'On a scale of 1 to 5, how easily distracted are you?': 'distractibility',
    'On a scale of 1 to 5 how much do you find it difficult to concentrate on things?': 'concentration_difficulty',
    '15. On a scale of 1-5, how often do you compare yourself to other successful people through the use of social media?': 'social_comparison',
    'How often do you feel depressed or down?': 'depressed_freq',
    'On a scale of 1 to 5, how often do you face issues regarding sleep?': 'sleep_issues',
    'How often does viewing the accounts of influencers and celebrities make you feel bad about your own appearance?': 'appearance_impact',
    'Do you find yourself hiding  or lying about the amount of time you have spend on social media or the kinds of digital content that you have consumed?': 'hides_usage',
    'Have you tried to get rid of your social media addiction?': 'tried_quit_raw',
    'How many hours have you used your device for social media last week(in hours)?': 'hours_last_week',
    'How often have you tried to get rid of your social media addiction?': 'quit_attempt_freq',
    'What measures did you take for the same in trying to get rid of  your addiction of social media?': 'measures_raw',
    'Have you felt any of the following symptoms because of social media usage?': 'symptom',
})

# -----------------------------------------------------------------------
# 2. CLEAN AGE — drop implausible ages (e.g. 10) for a student/working sample
# -----------------------------------------------------------------------
valid_age_mask = (df['age'] >= 13) & (df['age'] <= 70)
n_age_excluded = int((~valid_age_mask).sum())
df_age_clean = df[valid_age_mask].copy()

# -----------------------------------------------------------------------
# 3. CLEAN tried_quit_raw -> normalize to Yes/No (collapse free-text into Yes, since
#    all 3 stray text answers describe an actual attempt)
# -----------------------------------------------------------------------
def normalize_tried(val):
    if pd.isna(val):
        return np.nan
    v = str(val).strip().lower()
    if v == 'yes':
        return 'Yes'
    if v == 'no':
        return 'No'
    # free-text responses: classify based on content
    if 'no measure' in v or v == 'no':
        return 'No'
    return 'Yes'  # the other free-text answers describe attempts (alarms, uninstalling, etc.)

df['tried_quit'] = df['tried_quit_raw'].apply(normalize_tried)

# -----------------------------------------------------------------------
# 4. CLEAN measures_raw -> bucket free text into real categories, exclude junk
# -----------------------------------------------------------------------
JUNK_PATTERNS = [
    r'^no$', r'^nothing$', r'^na$', r'^nil$', r'^n/a$', r'^-+$', r'^\.+$',
    r'^[a-z]{1,6}$',  # short gibberish like 'babsb', 'dfgh', 'jajsjs'
    r'^\d+$',
]

CATEGORY_KEYWORDS = {
    'App time limits / screen-time tools': ['time limit', 'screen time', 'timer', 'alarm', 'app limit', 'usage limit'],
    'Deleted / uninstalled apps': ['uninstall', 'delete', 'deactivat', 'remove'],
    'Reduced usage gradually': ['reduce', 'less time', 'limit use', 'cut down', 'minimi'],
    'Digital detox / no-phone periods': ['detox', 'no phone', 'switch off', 'turn off', 'away from phone'],
    'Replaced with other activities': ['hobby', 'exercise', 'sport', 'book', 'read', 'gym', 'outdoor', 'study more', 'focus on stud'],
    'Sought support / talked to someone': ['friend', 'family', 'parent', 'counsel', 'talk'],
}

def is_junk(text):
    t = text.strip().lower()
    if t == '' or t == 'nan':
        return True
    for pat in JUNK_PATTERNS:
        if re.match(pat, t):
            return True
    return False

def categorize_measure(text):
    if pd.isna(text):
        return None
    t = str(text).strip()
    if is_junk(t):
        return None
    tl = t.lower()
    for cat, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in tl for kw in keywords):
            return cat
    return 'Other genuine attempt'

df['measure_category'] = df['measures_raw'].apply(categorize_measure)
n_measures_total = df['measures_raw'].notna().sum()
n_measures_junk = int(df['measures_raw'].apply(lambda x: is_junk(str(x)) if pd.notna(x) else False).sum())
n_measures_valid = int(df['measure_category'].notna().sum())

measure_counts = df['measure_category'].value_counts().to_dict()

# -----------------------------------------------------------------------
# 5. SYMPTOM cleanup (sparse column, 218 NaN out of 277)
# -----------------------------------------------------------------------
symptom_counts = df['symptom'].value_counts(dropna=True).to_dict()
n_symptom_respondents = int(df['symptom'].notna().sum())

# -----------------------------------------------------------------------
# 6. KEY STATS for the website / paper
# -----------------------------------------------------------------------
def pct(n, d):
    return round(100 * n / d, 1)

stats = {}
stats['sample_size_raw'] = RAW_N
stats['sample_size_age_clean'] = len(df_age_clean)
stats['n_age_excluded'] = n_age_excluded

# Jeopardized
jeo = df['jeopardized'].value_counts(dropna=False)
stats['jeopardized'] = {
    'yes': int(jeo.get('Yes', 0)),
    'no': int(jeo.get('No', 0)),
    'maybe': int(jeo.get('Maybe', 0)),
    'unknown': int(jeo.get('Unknown', 0)),
    'pct_yes': pct(jeo.get('Yes', 0), RAW_N),
    'pct_maybe_or_yes': pct(jeo.get('Yes', 0) + jeo.get('Maybe', 0), RAW_N),
}

# Tried to quit
tq = df['tried_quit'].value_counts(dropna=False)
valid_tq_n = int(df['tried_quit'].notna().sum())
stats['tried_quit'] = {
    'yes': int(tq.get('Yes', 0)),
    'no': int(tq.get('No', 0)),
    'valid_n': valid_tq_n,
    'pct_yes': pct(tq.get('Yes', 0), valid_tq_n),
}

# Quit attempt frequency (consistency)
qaf = df['quit_attempt_freq'].value_counts(dropna=False)
valid_qaf_n = int(df['quit_attempt_freq'].notna().sum())
order = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
stats['quit_attempt_freq'] = {
    'order': order,
    'counts': {k: int(qaf.get(k, 0)) for k in order},
    'pct': {k: pct(qaf.get(k, 0), valid_qaf_n) for k in order},
    'valid_n': valid_qaf_n,
}
# "Consistent quitters" = Often + Always ; "Inconsistent" = Rarely + Sometimes ; "Never tried" = Never
consistent = qaf.get('Often', 0) + qaf.get('Always', 0)
inconsistent = qaf.get('Rarely', 0) + qaf.get('Sometimes', 0)
never = qaf.get('Never', 0)
stats['quit_consistency_groups'] = {
    'consistent': int(consistent),
    'inconsistent': int(inconsistent),
    'never': int(never),
    'pct_consistent': pct(consistent, valid_qaf_n),
    'pct_inconsistent': pct(inconsistent, valid_qaf_n),
    'pct_never': pct(never, valid_qaf_n),
}

# Measures taken (cleaned)
stats['measures'] = {
    'categories': measure_counts,
    'n_total_responses': int(n_measures_total),
    'n_junk_excluded': n_measures_junk,
    'n_valid': n_measures_valid,
}

# Symptoms (sparse, present as % of those who answered)
stats['symptoms'] = {
    'counts': symptom_counts,
    'n_respondents': n_symptom_respondents,
    'n_total': RAW_N,
    'pct_of_respondents': {k: pct(v, n_symptom_respondents) for k, v in symptom_counts.items()},
}

# Demographics (age-cleaned subset for age stats only)
stats['demographics'] = {
    'gender': df['gender'].value_counts(dropna=False).to_dict(),
    'relationship': df['relationship'].value_counts(dropna=False).to_dict(),
    'occupation': df['occupation'].value_counts(dropna=False).to_dict(),
    'age_mean_cleaned': round(float(df_age_clean['age'].mean()), 1),
    'age_median_cleaned': float(df_age_clean['age'].median()),
    'age_min_cleaned': int(df_age_clean['age'].min()),
    'age_max_cleaned': int(df_age_clean['age'].max()),
}

# Platform usage
stats['platform'] = df['platform'].value_counts(dropna=False).to_dict()

# Daily SM hours bucket
stats['sm_hours_bucket'] = df['sm_hours_bucket'].value_counts(dropna=False).to_dict()

# Behavioral scales (1-5) - means
for col, label in [
    ('distractibility', 'Distractibility'),
    ('concentration_difficulty', 'Concentration difficulty'),
    ('social_comparison', 'Social comparison'),
    ('sleep_issues', 'Sleep issues'),
]:
    stats.setdefault('scale_means', {})[col] = round(float(df[col].mean()), 2)

# Frequency-scale questions (Never..Always) - distributions
for col, label in [
    ('time_loss_freq', 'time_loss_freq'),
    ('purposeless_use_freq', 'purposeless_use_freq'),
    ('depressed_freq', 'depressed_freq'),
    ('appearance_impact', 'appearance_impact'),
]:
    vc = df[col].value_counts(dropna=False)
    valid_n = int(df[col].notna().sum())
    stats.setdefault('freq_distributions', {})[col] = {
        'counts': {str(k): int(v) for k, v in vc.items()},
        'valid_n': valid_n,
    }

# Restless / hides_usage
stats['restless'] = df['restless'].value_counts(dropna=False).to_dict()
stats['hides_usage'] = df['hides_usage'].value_counts(dropna=False).to_dict()

# Cross-tab: tried_quit vs jeopardized (awareness -> action link)
ct = pd.crosstab(df['jeopardized'], df['tried_quit'])
stats['awareness_vs_action'] = ct.to_dict()

# Cross-tab: quit consistency vs jeopardized (does awareness predict consistency?)
df['consistency_group'] = df['quit_attempt_freq'].map(
    lambda x: 'Consistent' if x in ['Often', 'Always'] else ('Inconsistent' if x in ['Rarely', 'Sometimes'] else ('Never' if x == 'Never' else None))
)

with open('/home/claude/detoxa/stats.json', 'w') as f:
    json.dump(stats, f, indent=2, default=str)

print("Stats computed and saved.")
print(json.dumps(stats, indent=2, default=str)[:3000])
