"use client";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { fetch_request_history_by_name_and_type } from "@/services/ManagemenBackendAPI";
import EvaluationHistoryLeftBar from "@/components/judge/EvaluationHistoryLeftBar";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import React, { useState, useEffect, useRef } from "react";
import { Grid, Typography, Box, CircularProgress, Button } from "@mui/material";
import BarChart from "@/components/globals/BarChart";
import Footer from "@/components/globals/Footer";
import { API_TYPE_MULTITURN, API_TYPE_RATING, API_TYPE_SIMILARITY, API_TYPE_SINGLETURN, app_labels_and_config } from "@/services/Config";
import RatingSimilarityDataGrid from "@/components/judge/RatingSimilarityDataGridSummary";
import { v4 as uuidv4 } from 'uuid';
import DataGridSingleTurnSummary from "@/components/judge/DataGridSingleTurnSummary";
import DataGridMultiTurnSummary from "@/components/judge/DataGridMultiTurnSummary";

const ExperimentPage = () => {
  const params = useParams();
  const { experiment_name } = params; // Get the 'id' from the URL
  const { data: session, status } = useSession();
  const [singleTurnContent, setSingleTurnContent] = useState(null);
  const [multiTurnConversationContent, setMultiTurnConversationContent] = useState(null);
  const [ratingSimilarityContent, setRatingSimilarityContent] = useState(null);
  const [task_object, setTask_object] = useState(null);
  const [gradeData, setGradeData] = useState(null);
  const hasEffectRun = useRef(false);

  const flattenData_similarity_rating = (input) => {
    const result = [];

    input.forEach(item => {
          const keys =  item?.Question ? Object.keys(item.Question) : Object.keys(item.question); 

          keys.forEach(key => {
              const judgeit_score = item?.Grade ? item.Grade[key] : item.judgeit_score[key];
              const Question = item?.Question ? item.Question[key] : item.question[key];
              const judgeit_score_explanation = item?.Explanation ? item.Explanation[key] : item.judgeit_reasoning[key];
              result.push({
                  _id: uuidv4(),
                  question: Question,
                  golden_text: item.golden_text[key],
                  generated_text: item.generated_text[key],
                  judgeit_score: judgeit_score,
                  judgeit_reasoning: judgeit_score_explanation,
                  experiment_name: item.experiment_name,
                  name: item.name,
                  eval_type: item.eval_type
              });
          });
    });

    return result;
  };

  const flattenData_multi_turn = (input) => {
    const result = [];

    console.log(input, "*********************")
    input.forEach(item => {

        const keys =  Object.keys(item?.current_question);
        
        keys.forEach(key => {
            const judgeit_score = item?.Grade ? item.Grade[key] : item.judgeit_score[key];
            result.push({
                _id: uuidv4(),
                previous_question: item.previous_question[key],
                previous_answer: item.previous_answer[key],
                current_question: item.current_question[key],
                golden_rewritten_question: item.golden_rewritten_question[key],
                rewritten_question: item.rewritten_question[key],
                judgeit_score: judgeit_score,
                experiment_name: item.experiment_name,
                name: item.name,
                eval_type: item.eval_type
            });
        });
    });

    return result;
  }; 

  const flattenData_multi_turn_with_conversation = (input) => {
    const result = [];

    input.forEach(item => {
        const keys =  Object.keys(item?.follow_up_query);
        
        keys.forEach(key => {
            const judgeit_score = item?.Grade ? item.Grade[key] : item.judgeit_score[key];
            result.push({
                _id: uuidv4(),
                conversation_history: item.conversation_history[key],
                follow_up_query: item.follow_up_query[key],
                golden_query: item.golden_query[key],
                rewritten_query: item.rewritten_query[key],
                judgeit_score: judgeit_score,
                experiment_name: item.experiment_name,
                name: item.name,
                eval_type: item.eval_type
            });
        });
    });

    return result;
  }; 
  
  useEffect(() => {
    if (hasEffectRun.current) {
      return; // Prevents the effect from running again
    }

    const fetch_data = async () => {
      const history_data = await fetch_request_history_by_name_and_type(
        session.user.email,
        experiment_name,
        "batch"
      );

      if (history_data) {
        const contents = [];
        const grades_list = await Promise.all(
          history_data.map(async (item) => {
            //const data = await get_result_by_task_id(item.content.task_id);
            const data = await item?.content?.batch_result;
            data.experiment_name = item.experiment_name;
            data.name = item.name;
            data.eval_type = item.eval_type;

            contents.push(data);
            if (data && data?.status !== "ERROR") {
              const grades = data.Grade
                ? Object.values(data.Grade).filter(
                    (grade) => grade !== undefined
                  )
                : Object.values(data.judgeit_score).filter(
                    (score) => score !== undefined
                  );

              const gradeDistribution = grades.reduce((acc, grade) => {
                acc[grade] = (acc[grade] || 0) + 1;
                return acc;
              }, {});

              return {
                grades: gradeDistribution,
                name: item.name,
                eval_type: item.eval_type,
              };
            } else {
              return null;
            }
          })
        );
        setGradeData(grades_list);

        const multi_turn = contents.filter(
          (itm) => itm.eval_type === API_TYPE_SINGLETURN
        );

        const rating_similarity = contents.filter(
          (itm) => (itm.eval_type === API_TYPE_RATING || itm.eval_type === API_TYPE_SIMILARITY)
        );

        const multi_turn_conversation = contents.filter(
          (itm) => (itm.eval_type === API_TYPE_MULTITURN)
        );

        const flatten_rating_similarity = flattenData_similarity_rating(rating_similarity);
        const flatten_multi_turn = flattenData_multi_turn(multi_turn);
        const flatten_multi_turn_conversation = flattenData_multi_turn_with_conversation(multi_turn_conversation);

        setSingleTurnContent(flatten_multi_turn);
        setRatingSimilarityContent(flatten_rating_similarity);
        setMultiTurnConversationContent(flatten_multi_turn_conversation);
      }
    };

    if (session?.user.email) {
      fetch_data();
      hasEffectRun.current = true;
    }
  }, [session?.user.email, experiment_name]); // Empty dependency array, runs only once

  if (status === "loading") {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  return (
    <>
      <Box display={"flex"} flexDirection={"row"}>
        <Box display={"flex"} height={"100vh"} sx={{ overflowY: "auto" }}>
          <EvaluationHistoryLeftBar type={"batch"} />
        </Box>
        <Box width={"100%"} height={"93vh"} overflow={"scroll"}>
          <Grid spacing={0} sx={{ flexGrow: 1 }} container>
            <Grid item xs={11}>
              <Grid
                marginTop={"30px"}
                spacing={0}
                sx={{ flexGrow: 1 }}
                container
              >
                <Grid item xs={12}>
                  <Box
                    display={"flex"}
                    flexDirection={"row"}
                    justifyContent={"space-between"}
                  >
                    <Typography
                      style={{
                        fontSize: "24px",
                        marginLeft: "25px",
                        color: "#3B3B3B",
                        fontWeight: "bold",
                        marginBottom: "15px",
                      }}
                    >
                      Batch Evaluation - {experiment_name}
                    </Typography>
                    <Button
                      size="small"
                      href="/pages/batch"
                      startIcon={<ArrowBackOutlinedIcon />}
                    >
                      Back
                    </Button>
                  </Box>
                </Grid>
                <Grid
                  item
                  xs={12}
                  marginLeft={"25px"}
                  spacing={0}
                  sx={{ flexGrow: 1 }}
                  container
                >

                  {ratingSimilarityContent && (
                    <>
                    <Grid item xs={12} marginBottom={'10px'}>
                      <Typography fontSize={'20px'} fontWeight={'bold'}>Rating & Similarity data</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <RatingSimilarityDataGrid
                        serverData={ratingSimilarityContent}
                      />
                    </Grid>
                    </>
                  )}

                  {singleTurnContent && (
                    <>
                    <Grid item xs={12} marginTop={'20px'} marginBottom={'10px'}>
                      <Typography fontSize={'20px'} fontWeight={'bold'}>Single turn data</Typography>
                    </Grid>
                    <Grid item xs={12} marginBottom={'40px'}>
                      <DataGridSingleTurnSummary
                        serverData={singleTurnContent}
                      />
                    </Grid>
                    </>
                  )}

                  {multiTurnConversationContent && (
                    <>
                    <Grid item xs={12} marginTop={'20px'} marginBottom={'10px'}>
                      <Typography fontSize={'20px'} fontWeight={'bold'}>Multi turn data</Typography>
                    </Grid>
                    <Grid item xs={12} marginBottom={'40px'}>
                      <DataGridMultiTurnSummary
                        serverData={multiTurnConversationContent}
                      />
                    </Grid>
                    </>
                  )}

                  {gradeData &&
                    gradeData.map((gdata, index) => (
                      <Grid
                        item
                        xs={gradeData.length == 1 ? 12 : 6}
                        key={index}
                      >
                        <Box
                          sx={{ width: "90%", marginTop: 4, marginBottom: 2 }}
                        >
                          <Typography
                            style={{
                              fontSize: "16px",
                              color: "#3B3B3B",
                              margin: "10px",
                              fontWeight: "bold",
                              textDecoration: "none",
                            }}
                          >
                            {app_labels_and_config.pages.graph_title} -{" "}
                            {gdata && gdata.name}
                          </Typography>
                          {gdata && <BarChart gradeData={gdata.grades} />}
                        </Box>
                      </Grid>
                    ))}
                </Grid>
                <Grid item xs={12} marginLeft={"25px"} marginTop={"50px"}>
                  <Footer />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
};

export default ExperimentPage;
