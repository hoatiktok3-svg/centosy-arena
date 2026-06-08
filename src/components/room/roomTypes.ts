// Room types matching STEP 94 DB schema

export interface GameRoom {
  id:                          string
  code:                        string
  title:                       string
  status:                      'waiting' | 'playing' | 'showing_leaderboard' | 'finished' | 'cancelled'
  created_by:                  string
  question_set_id:             string | null
  current_question_index:      number
  current_question_started_at: string | null
  question_time_limit_s:       number
  total_questions:             number
  created_at:                  string
  finished_at:                 string | null
}

export interface RoomPlayer {
  id:           string
  room_id:      string
  user_id:      string
  display_name: string | null
  joined_at:    string
  total_score:  number
  correct_count: number
  final_rank:   number | null
  is_active:    boolean
}

export interface RoomAnswer {
  id:               string
  room_id:          string
  question_index:   number
  user_id:          string
  chosen_option:    number
  is_correct:       boolean
  response_time_ms: number
  points_earned:    number
  created_at:       string
}

export interface QuestionSet {
  id:          string
  title:       string
  description: string | null
  is_active:   boolean
}

export interface RoomQuestion {
  id:            string
  set_id:        string
  question_text: string
  options:       string[]
  correct_index: number
  points:        number
  order_index:   number
}
