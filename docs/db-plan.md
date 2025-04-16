# Schemat bazy danych dla TripFit

## 1. Lista tabel

### 1.1. users
Kolumny:
- id UUID PRIMARY KEY  
- email VARCHAR(255) UNIQUE NOT NULL  
- created_at TIMESTAMPTZ DEFAULT now() NOT NULL  
- encrypted_password VARCHAR NOT NULL  
- confirmed_at TIMESTAMPTZ

---

### 1.2. profiles
Kolumny:
- user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE  
- preferences VARCHAR NOT NULL 
- level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5)

---

### 1.3. journeys
Kolumny:
- id BIGSERIAL PRIMARY KEY  
- destination VARCHAR NOT NULL  
- departure_date DATE NOT NULL  
- return_date DATE NOT NULL  
- activities VARCHAR,  
- additional_notes TEXT NOT NULL  
- user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE  
- generation_ids BIGSERIAL[] DEFAULT '{}' -- lista identyfikatorów generacji
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()
- updated_at: TIMESTAMPTZ NOT NULL DEFAULT now() 
Ograniczenia:
- CHECK (departure_date <= return_date)

---

### 1.4. generations
Kolumny:
- id BIGSERIAL PRIMARY KEY  
- journey_id BIGSERIAL NOT NULL REFERENCES journeys(id)
- model VARCHAR NOT NULL  
- generated_count INTEGER NOT NULL DEFAULT 0  
- accepted_unedited_count INTEGER NOT NULL DEFAULT 0  
- accepted_edited_count INTEGER NOT NULL DEFAULT 0  
- source_text_hash TEXT NOT NULL  
- source_text_length INTEGER NOT NULL  
- created_at TIMESTAMPTZ NOT NULL DEFAULT now()  
- edited_at TIMESTAMPTZ NOT NULL DEFAULT now()

---

### 1.5. generation_error_logs
Kolumny:
- id BIGSERIAL PRIMARY KEY  
- journey_id BIGSERIAL NOT NULL REFERENCES journeys(id)
- user_id: UUID NOT NULL REFERENCES users(id)
- model VARCHAR NOT NULL  
- source_text_hash TEXT NOT NULL  
- source_text_length INTEGER NOT NULL  
- error_code VARCHAR(100) NOT NULL  
- error_message TEXT NOT NULL  
- error_timestamp TIMESTAMPTZ NOT NULL DEFAULT now()

---

## 2. Relacje między tabelami

- **users** 1-to-1 **profiles**  
  (profiles.user_id odnosi się do users.id)

- **users** 1-to-many **journeys**  
  (journeys.user_id odnosi się do users.id)

- **journeys** 1-to-many **generations**  
  (generations.journey_id odnosi się do journeys.id)

- **journeys** 1-to-many **generation_error_logs**  
  (generation_error_logs.journey_id odnosi się do journeys.id)

---

## 3. Indeksy

- `CREATE INDEX idx_profiles_user_id ON profiles(user_id);`
- `CREATE INDEX idx_journeys_user_id ON journeys(user_id);`
- `CREATE INDEX idx_generations_journey_id ON generations(journey_id);`
- `CREATE INDEX idx_generation_error_logs_journey_id ON generation_error_logs(journey_id);`
- `CREATE INDEX idx_journeys_generation_ids ON journeys USING GIN (generation_ids);`

---

## 4. Zasady PostgreSQL (RLS)

Na tabelach wykorzystujących kolumnę user_id (np. journeys) należy wdrożyć zasady RLS. 
Podobne polityki RLS należy wdrożyć dla tabel, które posiadają kolumnę user_id (np. profiles).

## 5. Dodatkowe uwagi
- Domyślne wartości dla kolumn created_at, edited_at oraz error_timestamp są ustawione na bieżący czas.
- Indeks GIN dla kolumny generation_ids w journeys wspiera wyszukiwanie elementów w tablicy.
