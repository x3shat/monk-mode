use std::sync::Mutex;
use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use tauri::Manager;

struct DbState(Mutex<Connection>);

#[derive(Serialize, Deserialize, Clone)]
struct WillpowerRule {
    id: i64,
    title: String,
    condition: String,
    intervention: String,
    details: String,
}

#[tauri::command]
fn get_rules(state: tauri::State<'_, DbState>) -> Result<Vec<WillpowerRule>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, title, condition, intervention, details FROM willpower_rules ORDER BY id ASC")
        .map_err(|e| e.to_string())?;
    let rules_iter = stmt
        .query_map([], |row| {
            Ok(WillpowerRule {
                id: row.get(0)?,
                title: row.get(1)?,
                condition: row.get(2)?,
                intervention: row.get(3)?,
                details: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut rules = Vec::new();
    for rule in rules_iter {
        rules.push(rule.map_err(|e| e.to_string())?);
    }
    Ok(rules)
}

#[tauri::command]
fn add_rule(
    state: tauri::State<'_, DbState>,
    title: String,
    condition: String,
    intervention: String,
    details: String,
) -> Result<i64, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO willpower_rules (title, condition, intervention, details) VALUES (?1, ?2, ?3, ?4)",
        (&title, &condition, &intervention, &details),
    )
    .map_err(|e| e.to_string())?;
    Ok(conn.last_insert_rowid())
}

#[tauri::command]
fn update_rule(
    state: tauri::State<'_, DbState>,
    id: i64,
    title: String,
    condition: String,
    intervention: String,
    details: String,
) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE willpower_rules SET title = ?1, condition = ?2, intervention = ?3, details = ?4 WHERE id = ?5",
        (&title, &condition, &intervention, &details, &id),
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn delete_rule(state: tauri::State<'_, DbState>, id: i64) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM willpower_rules WHERE id = ?1", [&id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

fn init_db(conn: &Connection) -> Result<(), rusqlite::Error> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS willpower_rules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            condition TEXT NOT NULL,
            intervention TEXT NOT NULL,
            details TEXT NOT NULL
        )",
        [],
    )?;

    // Check if table is empty
    let count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM willpower_rules",
        [],
        |row| row.get(0),
    )?;

    if count == 0 {
        let initial_rules = vec![
            (
                "Silent Dining",
                "Meal time",
                "Eat food at the dining table in TOTAL SILENCE",
                "No screens, no books, no conversation, no headphones. Treat eating as active mindfulness. Chewing food slowly helps lower immediate cortisol and build cognitive discipline."
            ),
            (
                "The Cryo Trigger",
                "Taking a shower",
                "Shower cold for the final 60 seconds",
                "Instantly floods the system with noradrenaline, resets cognitive fatigue, and trains your brain to remain calm in situations of high physiological distress."
            ),
            (
                "Emergency Drop Option",
                "When a toxic urge or severe craving hits",
                "DROP AND DO 10 PUSHUPS immediately",
                "Forces a somatic break on automatic behavioral pathways. The physical stimulus diverts blood and electrical firing away from executive-hijacking craving centers."
            ),
            (
                "Focus Tunnel Reset",
                "At the start of any Study Block / Focus Session",
                "Stare at a single spot on the wall for exactly 2 minutes",
                "Calibrates visual attention span and restricts peripheral field of view, triggering neurobiological pathways associated with deep executive focus."
            ),
            (
                "Mental Fortitude Overrides",
                "When you want to quit Studying or working mid-session",
                "Force yourself to study for exactly 10 more minutes",
                "Breaks the automatic habit loop of escaping stress. Rewires dopamine response by showing the brain that completing the hard action is survivable and rewarding."
            ),
            (
                "Emotional Solvent Reset",
                "Sunday evenings",
                "Spend 2 hours in complete solitude (Device-Free)",
                "Allows the brain and nervous system to process stored academic inputs and emotional stress, resetting emotional baseline for Monday morning."
            )
        ];

        for rule in initial_rules {
            conn.execute(
                "INSERT INTO willpower_rules (title, condition, intervention, details) VALUES (?1, ?2, ?3, ?4)",
                (rule.0, rule.1, rule.2, rule.3),
            )?;
        }
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let app_data_dir = app.path().app_data_dir()?;
            std::fs::create_dir_all(&app_data_dir)?;
            let db_path = app_data_dir.join("monk_mode.db");
            let conn = Connection::open(db_path)?;
            
            init_db(&conn)?;
            
            app.manage(DbState(Mutex::new(conn)));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_rules,
            add_rule,
            update_rule,
            delete_rule
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}